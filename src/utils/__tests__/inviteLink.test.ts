/// <reference types="jest" />
import { inviteRouteFor } from '../inviteLink';
import { INVITE_URL } from '../links';

describe('invite link routing', () => {
  it('maps the https invite link to the compare route and keeps the query', () => {
    expect(inviteRouteFor(`${INVITE_URL}?c=1QAAA&n=Ay%C5%9Fe`)).toBe('/compare?c=1QAAA&n=Ay%C5%9Fe');
  });

  it('accepts the path form with or without a trailing slash', () => {
    expect(inviteRouteFor('/atls/c/?c=1Q')).toBe('/compare?c=1Q');
    expect(inviteRouteFor('/atls/c?c=1Q')).toBe('/compare?c=1Q');
    expect(inviteRouteFor('/atls/c')).toBe('/compare');
  });

  it('leaves other links alone', () => {
    expect(inviteRouteFor('atls://compare?c=1Q')).toBeNull();
    expect(inviteRouteFor('atls://country/JP')).toBeNull();
    expect(inviteRouteFor('https://emirhan-coban.github.io/atls/')).toBeNull();
    expect(inviteRouteFor('/atls/cat?c=1')).toBeNull();
  });
});
