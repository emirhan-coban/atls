import { Skia } from '@shopify/react-native-skia';

/**
 * The whole Earth in one fragment shader: the sphere is ray-traced analytically per pixel (orthographic),
 * lit by a world-fixed sun, and the country ID map drives ocean masking, the user's status tint, the gold
 * selection and the celebration fill. See globeMath.ts for the coordinate conventions.
 *
 * Skia differences from the three.js prototype: texture coordinates are in pixels, texels are sRGB (decoded
 * with pow 2.2 and re-encoded at the end of the lighting), and every smoothstep has edge0 < edge1.
 */
export const GLOBE_SKSL = `
uniform shader dayTex;
uniform shader nightTex;
uniform shader idMap;
uniform shader statusLut;
uniform float2 dayRes;
uniform float2 nightRes;
uniform float2 idRes;
uniform float2 center;
uniform float radius;
uniform float3x3 toLocal;
uniform float3 sunDir;
uniform float time;
uniform float selectId;
uniform float3 selectColor;
uniform float selectPulse;
uniform float celebrateId;
uniform float celebrateT;
uniform float2 celebrateOrigin;
uniform float3 oceanDir;
uniform float oceanActive;
uniform float oceanTime;

const float PI = 3.14159265;

float wrapPi(float a) {
  return a - 6.2831853 * floor((a + PI) / 6.2831853);
}

float idAt(float2 p) {
  return floor(idMap.eval(float2(mod(p.x + idRes.x, idRes.x), clamp(p.y, 0.5, idRes.y - 0.5))).r * 255.0 + 0.5);
}

// 1 on a border or coastline, 0 inside a country or open sea; k is the reach in id-map texels
float borderAt(float2 p, float sid, float k) {
  float d = abs(idAt(p + float2(k, 0.0)) - sid) + abs(idAt(p - float2(k, 0.0)) - sid)
          + abs(idAt(p + float2(0.0, k)) - sid) + abs(idAt(p - float2(0.0, k)) - sid);
  return step(0.5, d);
}


half4 main(float2 xy) {
  float2 p = (xy - center) / radius;
  float r2 = dot(p, p);
  if (r2 > 1.0) return half4(0.0);

  float3 nW = float3(p.x, -p.y, sqrt(1.0 - r2));
  float3 nL = toLocal * nW;
  float u = fract(atan(nL.z, -nL.x) / 6.2831853 + 1.0);
  float v = acos(clamp(nL.y, -1.0, 1.0)) / PI;

  float3 s = normalize(sunDir);
  float day = smoothstep(-0.32, 0.18, dot(nW, s));

  float2 idPx = float2(floor(u * idRes.x) + 0.5, min(floor(v * idRes.y), idRes.y - 1.0) + 0.5);
  float sid = idAt(idPx);
  float ocean = 1.0 - step(0.5, sid);
  float facing = max(nW.z, 0.0);
  float ndl = dot(nW, s);
  float3 col = float3(0.0);

  float3 dayCol = pow(dayTex.eval(float2(u * dayRes.x, v * dayRes.y)).rgb, float3(2.2));
  float3 nightCol = pow(nightTex.eval(float2(u * nightRes.x, v * nightRes.y)).rgb, float3(2.2));
  col = dayCol * (0.58 + 1.05 * day);
  col += nightCol * (1.0 - day) * 0.5;
  float spec = pow(max(dot(nW, normalize(s + float3(0.0, 0.0, 1.0))), 0.0), 42.0) * ocean * day;
  col += spec * float3(0.7, 0.82, 1.0) * 0.28;
  col = mix(col, col * float3(0.72, 0.86, 1.12), ocean * 0.2);
  col = mix(col, col * 1.0 + float3(0.0, 0.012, 0.03), ocean);
  col *= mix(0.86, 1.0, smoothstep(0.0, 0.5, facing));
  col = pow(clamp(col, 0.0, 1.0), float3(0.4545));

  // The user's status colour for this country (premultiplied lookup, alpha divided back out)
  half4 st = statusLut.eval(float2(sid + 0.5, 0.5));
  float stA = float(st.a);
  float3 stCol = stA > 0.001 ? float3(st.rgb) / stA : float3(0.0);
  float isWant = step(0.001, stA) * (1.0 - step(0.9, stA));
  float tintAmt = step(0.001, stA) * 0.8 * (1.0 - isWant * (0.28 - 0.14 * sin(time * 2.0)));

  if (celebrateId > 0.5 && abs(sid - celebrateId) < 0.5) {
    float lon = atan(-nL.z, nL.x);
    float lat = asin(clamp(nL.y, -1.0, 1.0));
    float dLon = wrapPi(lon - celebrateOrigin.x) * cos(lat);
    float d = length(float2(dLon, lat - celebrateOrigin.y));
    float reach = celebrateT * 1.4;
    float fill = 1.0 - smoothstep(reach - 0.1, reach, d);
    tintAmt = tintAmt * fill;
    float ring = exp(-pow((d - reach + 0.05) * 14.0, 2.0)) * (1.0 - celebrateT) * step(0.001, celebrateT);
    col += stCol * (fill * (1.0 - celebrateT) * 0.35 + ring * 0.5);
  }
  // the user's countries: texture washed out underneath, solid colour on top, thin bright outline
  float hasSt = step(0.001, stA);
  float luma = dot(col, float3(0.3, 0.59, 0.11));
  col = mix(col, float3(luma), 0.55 * tintAmt);
  col = mix(col, stCol, tintAmt);
  col = mix(col, min(stCol * 1.25 + 0.08, float3(1.0)), hasSt * borderAt(idPx, sid, 2.0) * 0.9);

  float sel = step(0.5, selectId) * (1.0 - step(0.5, abs(sid - selectId)));
  col = mix(col, selectColor, sel * (0.55 + 0.1 * selectPulse));
  col += sel * pow(1.0 - facing, 3.0) * selectColor * 0.4;

  if (oceanActive > 0.001) {
    float d = acos(clamp(dot(normalize(nL), oceanDir), -1.0, 1.0));
    float env = 1.0 - smoothstep(0.0, 0.16, d);
    float crest = pow(max(sin(d * 78.0 - oceanTime * 3.0), 0.0), 3.2) * smoothstep(0.014, 0.05, d);
    float touch = 1.0 - smoothstep(0.0, 0.02, d);
    col += (crest * env * 0.72 + touch * 0.32) * ocean * oceanActive * float3(0.52, 0.8, 1.0);
  }

  float edge = 1.0 - smoothstep(1.0 - 1.5 / radius, 1.0, sqrt(r2));
  col = clamp(col, 0.0, 1.0);
  return half4(half3(col) * half(edge), half(edge));
}
`;

export const globeEffect = Skia.RuntimeEffect.Make(GLOBE_SKSL);
if (!globeEffect) {
  // Fails loudly in development: a shader that does not compile would otherwise render nothing at all
  console.warn('[globe] SkSL failed to compile');
}
