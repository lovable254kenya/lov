import { PageLayout } from "@/components/PageLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const CampsiteGuide = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <SEOHead
        title="Campsite Hosting Guide | RealTravo"
        description="Specialized guide for campsite and facility hosting on RealTravo. Learn about managing accommodations, activities, event grounds, and withdrawal policies."
        canonical="https://realtravo.com/campsite-guide"
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">



        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-primary tracking-tight">REALTRAVO</h1>
          <p className="text-lg text-muted-foreground mt-2">Specialized Guide for Campsite and Facility Hosting</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">1. Overview</h2>
            <p className="text-muted-foreground">
              REALTRAVO.COM offers a specialized hosting category for campsites and outdoor venues. Unlike standard booking platforms, our system allows you to manage accommodation, standalone activities, and professional event grounds (like wedding grounds and conference facilities) all in one listing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">2. Host Verification</h2>
            <p className="text-muted-foreground mb-3">
              To ensure the security of our community, all campsite hosts must complete a verification process.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Identity Check:</strong> Upload a National ID or Passport.</li>
              <li><strong className="text-foreground">Biometric Match:</strong> A live selfie is required to verify the document holder.</li>
              <li><strong className="text-foreground">Enforcement:</strong> Fraudulent registrations result in immediate account termination and potential legal action.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">3. Booking Security and Verification</h2>
            <p className="text-muted-foreground mb-3">
              We provide advanced tools to prevent fraud and ensure seamless entry at your grounds.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Rescheduling:</strong> Users can move their bookings to another date, allowing you to retain revenue while providing flexibility to guests.</li>
              <li><strong className="text-foreground">QR Code Scanning:</strong> Every booking generates a unique QR code. Hosts must scan this code upon arrival using the REALTRAVO app or dashboard.</li>
              <li><strong className="text-foreground">Fraud Protection:</strong> Once scanned, the code is marked as "Used" and cannot be reused. This prevents double-entry fraud and fake bookings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">4. Manual Entries (Free Host Feature)</h2>
            <p className="text-muted-foreground mb-3">
              Hosts can record offline walk-in guests using a dedicated manual link.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Scope:</strong> This feature is strictly for <strong>Facilities</strong> and <strong>Accommodation</strong> entries.</li>
              <li><strong className="text-foreground">Zero Commission:</strong> REALTRAVO does not charge service fees for any entries recorded manually through this link.</li>
              <li><strong className="text-foreground">Syncing:</strong> Manual entries automatically update your availability to prevent online double bookings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">5. Campsite Facility Management</h2>
            <p className="text-muted-foreground mb-3">
              Campsite hosts can manage diverse facilities and price them according to use.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Entrance Fees:</strong> Set distinct prices for Adults and Children for general entry.</li>
              <li><strong className="text-foreground">Accommodations:</strong> List Tree Houses, Camping Tents, and Lodges. Set the price per night and the maximum capacity for each.</li>
              <li><strong className="text-foreground">Event Grounds:</strong> List Wedding Grounds and Conference Halls. Facilities previously difficult to book online can now be reserved for a specific number of days.</li>
              <li><strong className="text-foreground">Double Booking Prevention:</strong> The system automatically disables booking once the capacity for a specific date is reached.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">6. Independent Activity Hosting</h2>
            <p className="text-muted-foreground mb-3">
              Activities at your campsite can be booked as standalone items, even if the guest is not staying overnight.
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Activities:</strong> List Swimming (Madfan), Ziplining, and other sports.</li>
              <li><strong className="text-foreground">Booking Details:</strong> Users select the activity, the visit date, and the number of people participating.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">7. Financial Terms</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong className="text-foreground">Commissions:</strong> A percentage fee is only applied to successful <strong>online</strong> bookings.</li>
              <li><strong className="text-foreground">Withdrawals:</strong> Funds are available for withdrawal via <strong>Bank</strong> or <strong>M-Pesa</strong> once the booking date is within 48 hours.</li>
            </ul>
          </section>

        </div>
      </div>
    </PageLayout>
  );
};

export default CampsiteGuide;
