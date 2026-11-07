// App Store screenshot compositor. Draws one 1290x2796 image: headline, subtitle and a raw simulator screenshot in a phone frame.
// Uses the system WebKit, so nothing needs to be installed.
//
// Usage: swiftc -O scripts/store-shots/render.swift -o /tmp/render
//        /tmp/render <raw.png> <out.png> "plain words" "italic gold words" "subtitle"
import AppKit
import WebKit

let args = CommandLine.arguments
guard args.count == 6 else {
    FileHandle.standardError.write(Data("usage: render <raw.png> <out.png> <plain> <italic> <subtitle>\n".utf8))
    exit(1)
}

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
let fonts = root.appendingPathComponent("node_modules/@expo-google-fonts/instrument-serif")
let template = root.appendingPathComponent("scripts/store-shots/template.html")
let raw = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])

func escape(_ s: String) -> String {
    s.replacingOccurrences(of: "&", with: "&amp;").replacingOccurrences(of: "<", with: "&lt;").replacingOccurrences(of: ">", with: "&gt;")
}

var html = try! String(contentsOf: template, encoding: .utf8)
html = html
    .replacingOccurrences(of: "{{FONT_REGULAR}}", with: fonts.appendingPathComponent("400Regular/InstrumentSerif_400Regular.ttf").absoluteString)
    .replacingOccurrences(of: "{{FONT_ITALIC}}", with: fonts.appendingPathComponent("400Regular_Italic/InstrumentSerif_400Regular_Italic.ttf").absoluteString)
    .replacingOccurrences(of: "{{RAW}}", with: raw.absoluteString)
    .replacingOccurrences(of: "{{PLAIN}}", with: escape(args[3]))
    .replacingOccurrences(of: "{{ITALIC}}", with: escape(args[4]))
    .replacingOccurrences(of: "{{SUB}}", with: escape(args[5]))

let temp = FileManager.default.temporaryDirectory.appendingPathComponent("atls-store-shot-\(getpid()).html")
try! html.write(to: temp, atomically: true, encoding: .utf8)

final class Loader: NSObject, WKNavigationDelegate {
    let view: WKWebView
    init(_ view: WKWebView) { self.view = view }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // give the web fonts and the screenshot a moment to decode before the snapshot
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { self.snapshot() }
    }
    func snapshot() {
        let config = WKSnapshotConfiguration()
        config.rect = CGRect(x: 0, y: 0, width: 1290, height: 2796)
        config.snapshotWidth = 1290
        view.takeSnapshot(with: config) { image, error in
            guard let image = image, let tiff = image.tiffRepresentation, let src = NSBitmapImageRep(data: tiff) else {
                FileHandle.standardError.write(Data("snapshot failed: \(String(describing: error))\n".utf8)); exit(2)
            }
            // retina screens render twice as many pixels; redraw into an exact 1290x2796 bitmap
            let dst = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 1290, pixelsHigh: 2796, bitsPerSample: 8, samplesPerPixel: 4,
                                       hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
            NSGraphicsContext.saveGraphicsState()
            NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: dst)
            src.draw(in: NSRect(x: 0, y: 0, width: 1290, height: 2796))
            NSGraphicsContext.restoreGraphicsState()
            try! dst.representation(using: .png, properties: [:])!.write(to: out)
            print("wrote \(out.path) \(dst.pixelsWide)x\(dst.pixelsHigh)")
            exit(0)
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let web = WKWebView(frame: NSRect(x: 0, y: 0, width: 1290, height: 2796))
let loader = Loader(web)
web.navigationDelegate = loader
let window = NSWindow(contentRect: web.frame, styleMask: [.borderless], backing: .buffered, defer: false)
window.contentView = web
web.loadFileURL(temp, allowingReadAccessTo: URL(fileURLWithPath: "/"))
app.run()
