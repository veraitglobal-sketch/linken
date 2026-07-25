type LogoCopyInput = {
  showLogo: boolean;
  cleared: boolean;
  pending: boolean;
  hasWebsite: boolean;
};

export function logoStateLabel(input: LogoCopyInput): string {
  if (input.showLogo) return "From website";
  if (input.cleared) return "Removed";
  if (input.pending) return "Fetching…";
  if (input.hasWebsite) return "No logo yet";
  return "Needs website";
}

export function logoBodyCopy(input: LogoCopyInput): string {
  if (input.showLogo) {
    return "Logo is live on your public profile and widgets.";
  }
  if (input.cleared) {
    return "Logo removed. Initials show until you restore it from the website.";
  }
  if (input.pending) return "Fetching logo from your website…";
  if (input.hasWebsite) return "Waiting for a logo from your website.";
  return "Add a website below to load a logo automatically.";
}
