import type { Metadata } from "next";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Help · QR Studio",
  description: "Answers to common questions about signing in, creating codes, credits and scan tracking.",
};

const sections = [
  {
    title: "Getting started",
    questions: [
      {
        question: "How do I sign in?",
        answer: "Click Sign in and use your Google account.",
      },
      {
        question: "I signed in but I can't see any stores. Why?",
        answer: "An admin needs to add your Google email to a store. Ask your admin to do this, then sign in again.",
      },
    ],
  },
  {
    title: "Codes",
    questions: [
      {
        question: "What is a dynamic code?",
        answer:
          "A dynamic code goes through a short QR Studio link. You can change where it points at any time, without reprinting it.",
      },
      {
        question: "What is a static code?",
        answer: "A static code points straight to its content and cannot be changed after it is created.",
      },
      {
        question: "Why isn't my scan showing up?",
        answer:
          "Check that the code is active and that you are looking at the right store. Disabled codes do not redirect.",
      },
    ],
  },
  {
    title: "Credits and payments",
    questions: [
      {
        question: "What is a credit?",
        answer: "Each new QR code uses one credit. Credits are bought per store.",
      },
      {
        question: "How do I buy credits?",
        answer: "Open your store, go to Billing, choose a pack and pay with Razorpay. Credits are added once payment succeeds.",
      },
      {
        question: "Can I get a refund?",
        answer: "See our Refund policy for the full terms.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Help</Heading>
        <Text>Answers to common questions. If you need more, visit the Contact page.</Text>
      </VStack>

      {sections.map((section) => (
        <VStack key={section.title} gap={3}>
          <Heading level={2}>{section.title}</Heading>
          {section.questions.map((item) => (
            <VStack key={item.question} gap={1}>
              <Heading level={3}>{item.question}</Heading>
              <Text>{item.answer}</Text>
            </VStack>
          ))}
        </VStack>
      ))}
    </VStack>
  );
}
