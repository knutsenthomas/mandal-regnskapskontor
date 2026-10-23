# Application shell

`src/app/Root.jsx` is the stable application entry. `src/app/shell/` contains the route/provider composition, loading boundary and consent-aware analytics component. Business pages remain in `src/pages/`; the common footer and header remain in `src/components/`.

Keep optional measurements behind SitePrivacy consent. Add pages to the route composition and keep business-specific logic in its page/component rather than the root entry.

Validate with `npm run build` and `node --experimental-vm-modules --test tests/*.test.mjs`. The VM flag enables the isolated mocked security tests; they do not contact external providers.
