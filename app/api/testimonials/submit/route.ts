import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitTestimonial } from "@/lib/sanity";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  quote: z.string().min(10, "Quote must be at least 10 characters"),
  role: z.string().optional(),
  // Note: Avatar upload would require file handling - leaving out for now
  // Can be added later with multipart/form-data handling
});

/**
 * POST /api/testimonials/submit - Submit a testimonial for review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = testimonialSchema.parse(body);

    const testimonialId = await submitTestimonial({
      name: validated.name,
      email: validated.email,
      quote: validated.quote,
      role: validated.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial submitted successfully. It will be reviewed before being published.",
        testimonialId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Testimonial submission API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SUBMISSION_ERROR",
          message: error instanceof Error ? error.message : "Failed to submit testimonial",
        },
      },
      { status: 500 }
    );
  }
}
