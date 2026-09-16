/** Cookiebot Vera on Hansala navy. Lime is the one accent. */
const INNER = [
  "#CybotCookiebotDialogHeader",
  "#CybotCookiebotDialogNav",
  "#CybotCookiebotDialogBody",
  "#CybotCookiebotDialogDetailBody",
  "#CybotCookiebotDialogBodyContent",
  "#CybotCookiebotDialogDetailBodyContent",
  "#CybotCookiebotDialogBodyButtonsWrapper",
  "#CybotCookiebotDialogDetailFooter",
  "#CybotCookiebotDialogTabContent",
  ".CybotCookiebotDialogContentWrapper",
].join(",");

const DIALOG = `
#CybotCookiebotDialogBodyUnderlay,#CybotCookiebotDialogDetailBodyUnderlay{background:rgba(8,20,18,.62)!important}
#CybotCookiebotDialog,#CybotCookiebotDialogDetail{position:fixed!important;top:50%!important;left:50%!important;right:auto!important;bottom:auto!important;transform:translate(-50%,-50%)!important;margin:0!important;width:32.5rem!important;max-width:calc(100vw - 32px)!important;min-width:280px!important;max-height:min(calc(100vh - 32px),42rem)!important;display:block!important;box-sizing:border-box!important;overflow:hidden!important;border:none!important;border-radius:20px!important;background:#0e1f1c!important;color:#f2f5f3!important;font-family:var(--font-ui),system-ui,sans-serif!important;box-shadow:0 28px 70px rgba(8,20,18,.18)!important;z-index:2147483646!important}
${INNER}{width:100%!important;max-width:100%!important;box-sizing:border-box!important;background:#0e1f1c!important;color:#f2f5f3!important;border-radius:0!important}
#CybotCookiebotDialogHeader{padding:0!important;margin:0!important;min-height:0!important;height:auto!important}
#CybotCookiebotDialogHeaderLogosWrapper,#CybotCookiebotDialogPoweredbyImage,#CybotCookiebotDialogPoweredbyCybot,#CybotCookiebotDialogPoweredByText{display:none!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important}
#CybotCookiebotDialogNav{border-bottom:1px solid rgba(242,245,243,.14)!important}
#CybotCookiebotDialogNavList{display:flex!important;width:100%!important;margin:0!important;padding:0!important;list-style:none!important}
#CybotCookiebotDialogNavList>li,.CybotCookiebotDialogNavItem{flex:1 1 0!important;margin:0!important;padding:0!important;text-align:center!important}
.CybotCookiebotDialogNavItemLink{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;color:#a8b2ad!important;font-size:.8125rem!important;font-weight:600!important;padding:1rem .5rem!important;border:none!important;border-bottom:3px solid transparent!important;background:transparent!important;border-radius:0!important;text-decoration:none!important}
.CybotCookiebotDialogNavItemLink.CybotCookiebotDialogActive{color:#cdef84!important;border-bottom-color:#cdef84!important}
#CybotCookiebotDialogNavItemAdSettings,#CybotCookiebotDialogNavAdSettings{display:none!important}
#CybotCookiebotDialogBody,#CybotCookiebotDialogDetailBody{overflow-x:hidden!important;overflow-y:auto!important}
#CybotCookiebotDialogBodyContent,#CybotCookiebotDialogDetailBodyContent{padding:1.5rem 1.5rem 1rem!important}
#CybotCookiebotDialogBodyContentTitle,#CybotCookiebotDialogDetailBodyContentTitle{font-size:1.25rem!important;font-weight:600!important;letter-spacing:-.02em!important;color:#f2f5f3!important;margin:0 0 .75rem!important}
#CybotCookiebotDialogBodyContentText,#CybotCookiebotDialogDetailBodyContentText{color:#c5cdc8!important;font-size:.9375rem!important;line-height:1.55!important}
#CybotCookiebotDialogBodyContentText a,.CybotCookiebotDialogDetailBodyContentCookieLink{color:#cdef84!important}
#CybotCookiebotDialogBodyLevelWrapper{display:none!important}
#CybotCookiebotDialogBodyButtonsWrapper,#CybotCookiebotDialogDetailFooter{display:flex!important;gap:.75rem!important;padding:0 1.5rem 1.5rem!important;border:none!important}
.CybotCookiebotDialogBodyButton{flex:1 1 0!important;width:auto!important;margin:0!important;min-height:2.75rem!important;padding:.75rem .875rem!important;font-size:.875rem!important;font-weight:600!important;border-radius:0!important;font-family:inherit!important}
#CybotCookiebotDialogBodyButtonDecline,#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection,.CybotCookiebotDialogBodyButtonDecline{display:none!important}
#CybotCookiebotDialogBodyLevelButtonCustomize,#CybotCookiebotDialogBodyLevelButtonCustomize.CybotCookiebotDialogHide{display:inline-flex!important;align-items:center!important;justify-content:center!important;order:1!important;background:transparent!important;color:#f2f5f3!important;border:1px solid #f2f5f3!important}
#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll,.CybotCookiebotDialogBodyButtonAccept{display:inline-flex!important;align-items:center!important;justify-content:center!important;order:2!important;background:#f0f2f0!important;color:#0e1f1c!important;border:1px solid #f0f2f0!important}
.CybotCookiebotFader{display:none!important}
@media (max-width:640px){#CybotCookiebotDialog,#CybotCookiebotDialogDetail{width:calc(100vw - 20px)!important}#CybotCookiebotDialogBodyButtonsWrapper,#CybotCookiebotDialogDetailFooter{flex-direction:column!important}}
`.trim();

const WIDGET = `
#CookiebotWidget{display:block!important;position:fixed!important;left:16px!important;bottom:16px!important;right:auto!important;top:auto!important;width:auto!important;height:auto!important;padding:0!important;margin:0!important;background:transparent!important;border:none!important;outline:none!important;box-shadow:none!important;overflow:visible!important;z-index:2147483645!important}
#CookiebotWidget .CookiebotWidget-logo,#CookiebotWidget .CookiebotWidget-open-toggle,#CookiebotWidget>button{display:flex!important;align-items:center!important;justify-content:center!important;width:2.75rem!important;height:2.75rem!important;min-width:2.75rem!important;min-height:2.75rem!important;padding:0!important;margin:0!important;border:none!important;outline:none!important;box-shadow:none!important;border-radius:50%!important;background:#0e1f1c!important;overflow:hidden!important;cursor:pointer!important}
#CookiebotWidget .CookiebotWidget-logo svg,#CookiebotWidget .CookiebotWidget-open-toggle svg,#CookiebotWidget>button svg{width:1.25rem!important;height:1.25rem!important;filter:brightness(0) invert(1)!important}
#CookiebotWidget .CookiebotWidget-content,#CookiebotWidget .CookiebotWidget-dialog,#CookiebotWidget [class*="Widget-content"],#CookiebotWidget [class*="Widget-dialog"]{width:20rem!important;max-width:calc(100vw - 32px)!important;min-width:16rem!important;height:auto!important;background:#0e1f1c!important;color:#f2f5f3!important;border:none!important;border-radius:20px!important;box-shadow:0 28px 70px rgba(8,20,18,.18)!important;overflow:hidden!important;padding:0!important;font-family:var(--font-ui),system-ui,sans-serif!important}
#CookiebotWidget .CookiebotWidget-body{width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;background:transparent!important;padding:1rem 1.25rem!important;overflow:visible!important}
#CookiebotWidget .CookiebotWidget-main-logo,#CookiebotWidget .CookiebotWidget-body svg,#CookiebotWidget .CookiebotWidget-body img{display:none!important}
#CookiebotWidget h2,#CookiebotWidget [class*="header"],#CookiebotWidget [class*="title"]{color:#f2f5f3!important;font-size:1rem!important;font-weight:600!important}
#CookiebotWidget button[aria-label*="close" i],#CookiebotWidget [class*="close"]{color:#f2f5f3!important;background:transparent!important;border:none!important;box-shadow:none!important}
#CookiebotWidget .CookiebotWidget-content button,#CookiebotWidget .CookiebotWidget-dialog button,#CookiebotWidget a[role="button"]{border-radius:0!important;font-weight:600!important;min-height:2.75rem!important;font-family:inherit!important}
#CookiebotWidget .CookiebotWidget-content button:first-of-type,#CookiebotWidget a[role="button"]:first-of-type{background:transparent!important;color:#f2f5f3!important;border:1px solid #f2f5f3!important}
#CookiebotWidget .CookiebotWidget-content button:last-of-type,#CookiebotWidget a[role="button"]:last-of-type{background:#f0f2f0!important;color:#0e1f1c!important;border:1px solid #f0f2f0!important}
`.trim();

export const COOKIEBOT_OVERRIDE_CSS = `${DIALOG}\n${WIDGET}`;
