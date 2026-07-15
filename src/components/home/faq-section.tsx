"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/shared/section-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HOME_FAQS } from "@/lib/constants/mock-data";

export function FaqSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="FAQ"
          title="Common Questions"
          description="Everything you need to know about shopping with RigNova."
        />

        <Accordion type="single" collapsible className="w-full">
          {HOME_FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">Still have questions?</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/faq">View All FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
