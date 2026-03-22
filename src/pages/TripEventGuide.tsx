import { PageLayout } from "@/components/PageLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const TripEventGuide = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="Trip & Event Hosting Guide | RealTravo"
        description="Official guide for hosting trips, events, and sports on RealTravo. Learn about verification, bookings, QR codes, and withdrawal policies."
        canonical="https://realtravo.com/trip-event-guide"
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">



        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tight">REALTRAVO</h1>
          <p className="text-lg text-muted-foreground mt-2">Official Guide for Trip, Event, and Sport Hosting</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to REALTRAVO.COM. This platform empowers hosts to manage and monetize group trips, one-time events, and sports activities. Our system provides advanced security and flexibility to ensure a seamless experience for both hosts and participants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">2. Host Verification Process</h2>
            <p className="text-muted-foreground mb-3">
              To maintain platform integrity, every host must undergo a mandatory verification process.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Identity Documents:</strong> Upload a clear photo of your National ID or Passport.</li>
              <li><strong className="text-foreground">Biometric Check:</strong> A live selfie is required for facial recognition matching.</li>
              <li><strong className="text-foreground">Compliance:</strong> Fraudulent registrations will be denied, and REALTRAVO reserves the right to take legal action against individuals providing false information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">3. Booking Flexibility and Security</h2>
            <p className="text-muted-foreground mb-3">
              We provide advanced tools to manage the user journey and secure your event entries.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Scheduling:</strong> Users have the flexibility to reschedule their bookings to another date. This feature helps hosts maintain attendance while providing better service to guests.</li>
              <li><strong className="text-foreground">QR Code Scanning:</strong> Every confirmed booking generates a unique QR code. Hosts must scan this code upon the guest's arrival at the event or trip meeting point.</li>
              <li><strong className="text-foreground">Fraud Protection:</strong> Once a QR code is scanned, it is instantly marked as used and cannot be used again. This strictly prevents fake entries and double-entry fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">4. Manual Entries (Free Host Feature)</h2>
            <p className="text-muted-foreground mb-3">
              A dedicated manual link is provided for hosts to record offline walk-in entries or direct bookings.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Scope:</strong> This feature is available for recording entries for <strong>Facilities</strong> and <strong>Accommodation</strong> categories only.</li>
              <li><strong className="text-foreground">Zero Commission:</strong> REALTRAVO does not charge any service fees or commission for entries recorded through this manual link.</li>
              <li><strong className="text-foreground">Inventory Management:</strong> Manual entries help you keep your availability updated and prevent online overbooking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">5. Hosting Categories</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Fixed Date Trips/Events:</strong> Set specific calendar dates and slot limits.</li>
              <li><strong className="text-foreground">Flexible Date Trips:</strong> Allow users to request dates within a set range. <strong>Note:</strong> Once slots are full, the host must update the booking afresh from the hosting panel.</li>
              <li><strong className="text-foreground">Sports:</strong> Athletic activities generally operate on a fixed-date basis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">6. Financial and Withdrawal Policy</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Service Fees:</strong> A percentage commission is only charged after a successful <strong>online</strong> booking.</li>
              <li><strong className="text-foreground">Withdrawals:</strong> Hosts can initiate a withdrawal via <strong>Bank</strong> or <strong>M-Pesa</strong> when the trip/event is within 48 hours of the scheduled start time.</li>
            </ul>
          </section>

        </div>
      </div>
    </PageLayout>
  );
};

export default TripEventGuide;
