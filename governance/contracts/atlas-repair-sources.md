# Atlas foundation repair: primary-source map

This small register explains which external standards informed the repair. It is
not an endorsement, a claim that Atlas conforms to every source, or a substitute
for the repository's own tests and acceptance records.

| Repair boundary | Primary source used | What Atlas adopts here | What remains outside the claim |
| --- | --- | --- | --- |
| Cloudflare telemetry disclosure | [Cloudflare RUM beacon](https://developers.cloudflare.com/speed/observatory/rum-beacon/) | Separates local analysis input from host-level visit and performance measurement. | No claim that Cloudflare collects nothing or that this repository controls the injected beacon. |
| Static response headers | [Cloudflare Pages `_headers`](https://developers.cloudflare.com/pages/configuration/headers/) | Keeps route-scoped static header policy in a reviewable file. | A source-file check is not a post-deployment header receipt. Pages Functions would need their own response headers. |
| Source-to-deployment boundary | [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) | Treats the connected repository and deployed commit as observable release inputs. | A passing Git check does not prove global edge convergence or an installed PWA cache state. |
| Keyboard, semantics, reflow, and non-colour cues | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Uses native controls, landmarks, visible focus, labelled content, and responsive layouts. | This packet is not a WCAG conformance certification. |
| Browser storage | [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) | Bounds retained text with typed envelopes, expiry, caps, one-use handling, and user clearing. | Browser storage is not treated as confidential storage. |
| Offline shell | [W3C Service Workers](https://www.w3.org/TR/service-workers/) | Makes the declared cache closure explicit and fails installation if a required core asset is missing. | This does not prove every optional route or every user's existing cache is current. |
| URL and history behavior | [WHATWG HTML navigation and history](https://html.spec.whatwg.org/multipage/nav-history-apis.html) | Uses an allowlisted route state, `pushState`, and `popstate` so Back and Share preserve the selected tool. | The route is presentation state, not an accepted research-state transition. |

The deterministic evidence for these applications lives in the adjacent
contracts and `governance/harnesses/`. Where the repository does not yet have
enough evidence—per-term review receipts, canonical projection policy,
post-deploy headers, browser performance, or fresh-install PWA behavior—the
result remains explicitly pending rather than inferred.
