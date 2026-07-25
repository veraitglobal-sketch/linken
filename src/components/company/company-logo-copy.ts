type LogoCopyInput = {
  showLogo: boolean;
  isManual: boolean;
  cleared: boolean;
  pending: boolean;
  hasWebsite: boolean;
};

export function logoStateLabel(input: LogoCopyInput): string {
  if (input.isManual) return "Uploaded";
  if (input.showLogo) return "From website";
  if (input.cleared) return "Removed";
  if (input.pending) return "Fetching…";
  if (input.hasWebsite) return "No logo yet";
  return "Needs website";
}

export function logoBodyCopy(input: LogoCopyInput): string {
  if (input.showLogo) {
    return input.isManual
      ? "Custom logo is live on your profile and widgets."
      : "Logo is live on your public profile and widgets.";
  }
  if (input.cleared) {
    return "Logo removed. Upload a new one, or restore from the website.";
  }
  if (input.pending) return "Fetching logo from your website…";
  if (input.hasWebsite) {
    return "Waiting for a logo from your website — or upload one.";
  }
  return "Add a website to auto-load a favicon, or upload a logo.";
}
