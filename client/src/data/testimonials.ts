export interface Testimonial {
  name: string;
  title: string;
  company: string;
  avatar: string; // Could be initials or image URL
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Jane Doe',
    title: 'CTO',
    company: 'TechSolutions Inc.',
    avatar: 'JD',
    quote: 'PumpFlux saved our team over 30 hours per week by automating our customer onboarding process. The ROI was immediate and the implementation was surprisingly simple.'
  },
  // Add more testimonials as needed
]; 