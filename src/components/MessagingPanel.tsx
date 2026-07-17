"use client";

import React, { useState, useRef } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { useEhr } from "@/context/EhrContext";

export default function MessagingPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { messages, sendMessage, currentUser } = useEhr();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Autocomplete state
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);

  const availableMentionRoles = [
    { tag: "doctor", label: "Attending Doctor" },
    { tag: "nurse", label: "Ward Nurse" },
    { tag: "pharmacist", label: "Pharmacist" },
    { tag: "lab_scientist", label: "Lab Scientist" },
    { tag: "radiologist", label: "Radiologist" },
    { tag: "receptionist", label: "Receptionist" },
    { tag: "accountant", label: "Accountant" },
    { tag: "super_admin", label: "Super Admin" },
    { tag: "hospital_admin", label: "Hospital Admin" },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
    setShowMentionSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      const segment = textBeforeCursor.slice(lastAtIdx + 1);
      if (!segment.includes(" ")) {
        setShowMentionSuggestions(true);
        setMentionQuery(segment);
        setMentionIndex(lastAtIdx);
        return;
      }
    }
    setShowMentionSuggestions(false);
  };

  const handleSelectMention = (roleTag: string) => {
    const before = text.slice(0, mentionIndex);
    const after = text.slice(mentionIndex + mentionQuery.length + 1);
    const newText = `${before}@${roleTag} ${after}`;
    setText(newText);
    setShowMentionSuggestions(false);

    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const filteredRoles = availableMentionRoles.filter(
    (r) =>
      r.tag.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      r.label.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const isMessageVisibleToRole = (msgText: string, senderRole: string, userRole: string): boolean => {
    // Senders always see their own messages
    if (senderRole === userRole) {
      return true;
    }

    // Find all @mentions in the text
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(msgText)) !== null) {
      mentions.push(match[1].toLowerCase());
    }

    // If no mentions are present, it is a public care team message
    if (mentions.length === 0) {
      return true;
    }

    // Map userRole to standard department mention tags
    const myMentionTags = [userRole.toLowerCase()];
    if (userRole === "doctor") {
      myMentionTags.push("doctor", "doctors", "medicine", "attending");
    } else if (userRole === "nurse") {
      myMentionTags.push("nurse", "nurses", "ward", "care");
    } else if (userRole === "pharmacist") {
      myMentionTags.push("pharmacist", "pharmacists", "pharmacy", "rx");
    } else if (userRole === "lab_scientist") {
      myMentionTags.push("lab", "scientist", "scientists", "pathology");
    } else if (userRole === "radiologist") {
      myMentionTags.push("radiologist", "radiologists", "imaging");
    } else if (userRole === "receptionist") {
      myMentionTags.push("receptionist", "receptionists", "reception", "him");
    } else if (userRole === "accountant") {
      myMentionTags.push("accountant", "accountants", "finance", "billing");
    } else if (userRole === "super_admin" || userRole === "hospital_admin") {
      myMentionTags.push("admin", "admins", "administrator", "management");
    }

    // Return true if any of the parsed mentions match the user's tags
    return mentions.some((m) => myMentionTags.includes(m));
  };

  if (!isOpen) return null;

  // Process and filter messages to group by date
  const renderedElements: React.ReactNode[] = [];
  let lastDateString = "";

  const visibleMessages = messages.filter((msg) =>
    isMessageVisibleToRole(msg.text, msg.senderRole, currentUser.role)
  );

  visibleMessages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateLabel = "";
    const isToday =
      msgDate.getUTCFullYear() === today.getUTCFullYear() &&
      msgDate.getUTCMonth() === today.getUTCMonth() &&
      msgDate.getUTCDate() === today.getUTCDate();

    const isYesterday =
      msgDate.getUTCFullYear() === yesterday.getUTCFullYear() &&
      msgDate.getUTCMonth() === yesterday.getUTCMonth() &&
      msgDate.getUTCDate() === yesterday.getUTCDate();

    if (isToday) {
      dateLabel = "Today";
    } else if (isYesterday) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = msgDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    }

    if (dateLabel !== lastDateString) {
      lastDateString = dateLabel;
      renderedElements.push(
        <div key={`date-${dateLabel}`} className="flex justify-center my-3">
          <span className="bg-accent text-secondary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-xs border border-border/30">
            {dateLabel}
          </span>
        </div>
      );
    }

    const isSelf = msg.senderRole === currentUser.role;
    renderedElements.push(
      <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-3`}>
        <div
          className={`max-w-[75%] rounded-lg p-2.5 text-xs ${
            isSelf
              ? "bg-primary text-white rounded-br-none shadow"
              : "bg-card border border-border rounded-bl-none shadow-sm"
          }`}
        >
          <div className="flex justify-between items-center mb-1 text-[8px] font-bold opacity-80 uppercase tracking-wider space-x-2">
            <span>
              {msg.sender ||
                (msg.senderRole === "doctor"
                  ? "Attending Doctor"
                  : msg.senderRole === "nurse"
                  ? "Ward Nurse"
                  : "Staff Member")}{" "}
              ({msg.senderRole.replace("_", " ")})
            </span>
          </div>
          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          <div className="text-right text-[8px] opacity-60 font-mono mt-1">
            {String(msgDate.getUTCHours()).padStart(2, "0")}:{String(msgDate.getUTCMinutes()).padStart(2, "0")}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96 h-[450px] bg-card text-card-foreground border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="bg-primary px-4 py-3 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-bold text-xs">Care Team Messaging</h3>
            <p className="text-[9px] text-white/80">Active Staff Intercom</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-accent/25">
        {renderedElements.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-secondary italic">
            No messages in this workspace yet.
          </div>
        ) : (
          renderedElements
        )}
      </div>

      {/* Mention Auto-Complete suggestions dropdown */}
      {showMentionSuggestions && filteredRoles.length > 0 && (
        <div className="absolute bottom-[56px] left-3 right-3 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-border max-h-40 overflow-y-auto">
          <div className="px-3 py-1.5 text-[9px] font-bold text-secondary uppercase bg-accent/30 tracking-wider">
            Mention Role / Department
          </div>
          {filteredRoles.map((r) => (
            <button
              key={r.tag}
              type="button"
              onClick={() => handleSelectMention(r.tag)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 hover:text-primary transition-all flex items-center space-x-1.5 text-foreground"
            >
              <span className="font-bold text-primary">@{r.tag}</span>
              <span className="text-[9px] text-secondary">({r.label})</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center bg-card relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Message care team (use @ for departments)..."
          value={text}
          onChange={handleInputChange}
          className="flex-1 bg-accent/30 text-xs px-3 py-2 border border-border rounded-lg mr-2 outline-none focus:border-primary text-foreground"
        />
        <button type="submit" className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all shadow">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
