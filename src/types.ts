export interface Message {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  attachNames?: string[];
}

export interface Session {
  id: number;
  title: string;
  messages: Message[];
  incognito: boolean;
}

export interface Attachment {
  type: "image" | "text" | "zip" | "file";
  name: string;
  mime?: string;
  dataUrl?: string;
  content?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
}
