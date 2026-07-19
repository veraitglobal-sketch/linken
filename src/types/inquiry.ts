export type InquiryStatus = "new" | "read" | "replied" | "archived";

export type Inquiry = {
  id: string;
  companyId: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
  message: string;
  serviceInterest: string;
  status: InquiryStatus;
  createdAt: string;
};
