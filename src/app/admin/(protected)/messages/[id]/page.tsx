import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessageById, markMessageRead } from "@/repositories/messages.repository";
import { MessageDetail } from "@/components/admin/messages/message-detail";

export const metadata: Metadata = {
  title: "Message · Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  let message;
  try {
    message = await getMessageById(id);
  } catch {
    notFound();
  }

  if (!message) notFound();

  // Auto-mark as read when an admin opens the detail page.
  if (!message.readAt) {
    try {
      await markMessageRead(id);
    } catch {
      // Non-critical — the page still renders.
    }
  }

  return <MessageDetail message={message} />;
}
