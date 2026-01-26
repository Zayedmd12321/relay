const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path if needed
const Query = require('./models/Query'); // Adjust path if needed

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/queryflow')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// --- DATA CONFIGURATION ---

const PARTICIPANT_NAMES = [
  'aadi', 'aanya', 'abhinav', 'anushka', 'ashutosh', 
  'ayush', 'ishan', 'nishista', 'pratik', 'sachin', 
  'soham', 'uttam', 'ved', 'vipin'
];

const HEAD_NAMES = ['kamalesh', 'parth'];
const ADMIN_NAME = 'Zayed';

// NSSC Themed Context Data
const SAMPLE_QUERIES = [
  {
    title: "Registration payment not reflecting in dashboard",
    description: "I made the payment for Hoverpod event registration yesterday through UPI (Transaction ID: HDFC938475920). The amount of ₹300 was debited from my account but my dashboard still shows 'Payment Pending'. Please verify and update my registration status.",
    domain: "Payments"
  },
  {
    title: "Hostel accommodation for team members",
    description: "Our team of 5 members is coming from Mumbai University to participate in the Rocrun competition. We need hostel accommodation for 3 nights (Feb 14-17). Can you arrange rooms for us? Also, is bedding provided or should we bring our own?",
    domain: "Hospitality"
  },
  {
    title: "Hoverpod competition rulebook clarification",
    description: "In the Hoverpod rulebook Version 2.1, Rule 4.3 states that maximum thrust is 5N. Could you please clarify if this refers to total thrust from all motors combined or thrust per individual motor? This is critical for our design.",
    domain: "Events"
  },
  {
    title: "Transportation from Kharagpur Railway Station",
    description: "Our team's train arrives at Kharagpur Junction at 2:45 AM on February 15th. Will there be institute buses or shuttle service available at that time? If not, what are the alternative transport options to reach the campus?",
    domain: "Transport"
  },
  {
    title: "Workshop participation certificate not received",
    description: "I attended the CAD Workshop on January 20th and completed all sessions. I was told certificates would be emailed within 7 days, but I haven't received mine yet. My registration ID is WS2026-CAD-1847. Please look into this.",
    domain: "Certificates"
  },
  {
    title: "Team member replacement in Quiz competition",
    description: "One of our registered team members, Rahul Sharma (ID: QZ2026-451), tested positive for COVID and cannot attend. Can we replace him with another student from our college? The replacement's name is Ankit Verma. Quiz is scheduled for Feb 16.",
    domain: "Registration"
  },
  {
    title: "Mess food and meal coupon details",
    description: "Is mess food included in the ₹500 registration fee or do we need to purchase meal coupons separately? If coupons are needed, what's the cost and where can we buy them? Also, are there vegetarian options available?",
    domain: "Hospitality"
  },
  {
    title: "Rocrun arena specifications unclear",
    description: "The rulebook mentions the arena dimensions as '10x10' but doesn't specify the unit. Is it 10 feet x 10 feet or 10 meters x 10 meters? We need accurate dimensions to build our bot accordingly. Please clarify urgently.",
    domain: "Events"
  },
  {
    title: "WiFi access for Hackathon participants",
    description: "I'm registered for the 24-hour Hackathon starting Feb 15. Will guest WiFi credentials be provided? Our project requires continuous internet for API calls and GitHub commits. Also, what's the expected bandwidth?",
    domain: "Tech Support"
  },
  {
    title: "Duplicate registration refund request",
    description: "I accidentally registered twice for the Space Nova workshop - Transaction IDs: UPI847293651 (₹250) and UPI847293889 (₹250). I only need one registration. Please refund the duplicate payment to my account ending with 4527.",
    domain: "Payments"
  },
  {
    title: "ID card requirements for entry",
    description: "Do we need to bring our college ID cards for entry to the fest? I'm from outside IIT KGP and want to confirm what documents are required at the gate. Also, is there a separate registration desk for outstation participants?",
    domain: "Registration"
  },
  {
    title: "Drone Workshop timing conflict with Robotics event",
    description: "I'm registered for both the Drone Workshop (Feb 16, 2-5 PM) and the Robotics Battle (Feb 16, 3-6 PM). There's a 3-hour overlap. Can I reschedule either of these or attend the workshop on a different day?",
    domain: "Events"
  },
  {
    title: "Power supply specifications for exhibition stall",
    description: "Our team has a project exhibition stall (Stall No. E-47). We need 230V AC power for our demonstration. What's the maximum power load allowed per stall? We'll be running 2 laptops, 1 monitor, and LED lights (total ~400W).",
    domain: "Tech Support"
  },
  {
    title: "Team size limit for Hackathon",
    description: "The website says Hackathon teams can have 2-4 members, but during registration it only allows adding 3 members maximum. We want to register with 4 people. Is this a bug or has the rule changed?",
    domain: "Registration"
  },
  {
    title: "Medical facility availability during fest",
    description: "I have a chronic condition and need to know if there's a medical room or first aid facility available on campus during the fest. Also, is there a pharmacy nearby for emergency medicine purchases?",
    domain: "Hospitality"
  },
  {
    title: "Presentation format for Paper Presentation event",
    description: "For the Technical Paper Presentation on Feb 17, should we prepare PPT or PDF? What's the time limit per presentation? Also, will projectors and laptops be provided or should we bring our own?",
    domain: "Events"
  },
  {
    title: "Parking facility for participants",
    description: "I'm driving from Kolkata with my team (4 people). Is there parking available inside the campus for participant vehicles? If yes, is it free or do we need to pay? Our car registration is WB01AB1234.",
    domain: "Transport"
  },
  {
    title: "Prize money distribution timeline",
    description: "We won 2nd place in the Hoverpod competition yesterday. The announcement said prize money would be transferred within 15 days. Will it be direct bank transfer or cheque? Also, do we need to submit any documents for this?",
    domain: "Payments"
  },
  {
    title: "Female participant accommodation safety",
    description: "I'm a female participant traveling solo from Bangalore. Can you ensure separate hostel accommodation for female participants with proper security? Also, what are the hostel check-in and check-out timings?",
    domain: "Hospitality"
  },
  {
    title: "Event schedule PDF not downloading",
    description: "The 'Download Schedule' button on the events page isn't working. It shows a 404 error when I click it. I need the detailed event timetable to plan which competitions to attend. Can you fix this or email me the PDF?",
    domain: "Tech Support"
  },
  {
    title: "Sponsorship stall setup timing",
    description: "We're the official sponsor for the Robotics zone and need to set up our stall by Feb 14, 10 AM. When can we start the setup? Also, who should we contact for electricity connection and branding permissions?",
    domain: "Events"
  },
  {
    title: "Group discount for college delegation",
    description: "We have 25 students from our college planning to attend. Is there any group discount available for bulk registrations? If yes, what's the discount percentage and what's the minimum group size required?",
    domain: "Payments"
  },
  {
    title: "Lost item during workshop",
    description: "I lost my black JBL headphones during the Arduino Workshop yesterday (Jan 24) in LHC Hall. Has anyone submitted it to the lost and found? How can I check? The headphones have 'SK' written on the right cup.",
    domain: "Hospitality"
  },
  {
    title: "Abstract submission deadline extension",
    description: "The abstract submission deadline for Paper Presentation was Jan 25, but our professor only approved our topic today. Can you extend the deadline by 2-3 days? Our paper is ready, we just need time to format the abstract.",
    domain: "Events"
  },
  {
    title: "Volunteer registration still open?",
    description: "I'm a first-year student at IIT KGP and want to volunteer for the fest. Is volunteer registration still open? What are the perks for volunteers and what would be my responsibilities? I can give 6-8 hours daily.",
    domain: "Registration"
  }
];

const POSSIBLE_ANSWERS = {
  "Payments": "We have verified your transaction with the bank. The payment status has been updated on your dashboard. You should now see 'Payment Confirmed'. If you still face issues, please reply with a screenshot of your transaction receipt.",
  "Hospitality": "Accommodation is provided in student hostels on a shared basis (4-6 per room). Guest house rooms are reserved for faculty and VIP guests. Bedding and basic amenities are provided. Please report to the Hospitality Desk near New SAC for room allocation.",
  "Events": "Thank you for pointing this out. This refers to the TOTAL combined thrust from all motors. We've updated the rulebook to v2.2 with this clarification. Please download the latest version from the events page.",
  "Transport": "Yes, NSSC shuttle buses will be running throughout the night from Kharagpur Railway Station to campus. Look for buses with the 'NSSC Fest 2026' banner. Frequency is every 45 minutes. You can also take a prepaid auto (₹80-100) from the station.",
  "Registration": "Team member substitution is allowed up to 48 hours before the event start time. Please email the updated team details (Name, College, ID proof) to registration@nssc.in with subject line 'Team Change - [Event Name]'. You'll receive a confirmation within 6 hours.",
  "Tech Support": "Yes, temporary guest WiFi credentials will be provided at the registration desk. Username and password will be printed on your participant ID card. Network name: NSSC-Guest-2026. Bandwidth is 50 Mbps shared. For hackathon participants, dedicated high-speed WiFi is available in the hackathon zone.",
  "Certificates": "We apologize for the delay. Certificates are being processed in batches. Your certificate has been generated and will be emailed to your registered email address within 24 hours. Please check your spam folder as well.",
  "Transport": "Parking is available at the New Academic Complex parking lot (Zone-C). It's free for participants. Please display your participant ID card on the dashboard. Security will be present 24/7 during the fest."
};

const DISMANTLE_REASONS = [
  "Duplicate query - already resolved in ticket #previous",
  "Question answered in official FAQ section on website",
  "Incomplete information - participant didn't respond to clarification request",
  "Issue resolved automatically after system update",
  "Query not relevant to NSSC Fest 2026",
  "Spam or test query - marked as invalid"
];

// --- SEEDING LOGIC ---

const importData = async () => {
  try {
    // 1. CLEAR EXISTING DATA
    await User.deleteMany();
    await Query.deleteMany();
    console.log('Data Destroyed...');

    // 2. CREATE USERS
    const usersToCreate = [];

    // Create Admin
    usersToCreate.push({
      name: ADMIN_NAME,
      email: `${ADMIN_NAME.toLowerCase()}@nssc.in`,
      password: 'password123',
      role: 'Admin',
      isVerified: true
    });

    // Create Heads
    HEAD_NAMES.forEach(name => {
      usersToCreate.push({
        name: name,
        email: `${name}@nssc.in`,
        password: '123456',
        role: 'Team_Head',
        isVerified: true
      });
    });

    // Create Participants
    PARTICIPANT_NAMES.forEach(name => {
      usersToCreate.push({
        name: name,
        email: `${name}@nssc.in`,
        password: '123456', // Will be hashed by pre-save hook
        role: 'Participant',
        isVerified: true
      });
    });

    // Save users one by one to ensure pre-save hook (hashing) runs
    const createdUsers = [];
    for (const u of usersToCreate) {
      const user = await new User(u).save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} Users...`.green);

    // Filter Users for mapping
    const participants = createdUsers.filter(u => u.role === 'Participant');
    const heads = createdUsers.filter(u => u.role === 'Team_Head');
    const admin = createdUsers.find(u => u.role === 'Admin');

    // 3. CREATE QUERIES
    const queriesToCreate = [];

    // Generate 25 random queries
    for (let i = 0; i < 80; i++) {
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
      const randomContent = SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)];
      
      // Determine Status (Weighted randomness)
      const rand = Math.random();
      let status = 'UNASSIGNED';
      if (rand > 0.3) status = 'ASSIGNED';
      if (rand > 0.6) status = 'RESOLVED';
      if (rand > 0.9) status = 'DISMANTLED';

      const queryObj = {
        title: randomContent.title,
        description: randomContent.description,
        createdBy: randomParticipant._id,
        status: status,
      };

      // Add Logic based on status
      if (status !== 'UNASSIGNED') {
        const randomHead = heads[Math.floor(Math.random() * heads.length)];
        
        // Heads are assigned
        queryObj.assignedTo = randomHead._id;

        if (status === 'RESOLVED') {
          queryObj.answer = POSSIBLE_ANSWERS[randomContent.domain] || "The team has noted your query and resolved the backend issue.";
        }

        if (status === 'DISMANTLED') {
           queryObj.dismantledReason = DISMANTLE_REASONS[Math.floor(Math.random() * DISMANTLE_REASONS.length)];
           // Dismantled usually doesn't need an assignee, but sometimes a head dismantles it.
           // Leaving assignedTo as is (the head who dismantled it).
        }
      }

      queriesToCreate.push(queryObj);
    }

    await Query.insertMany(queriesToCreate);
    console.log(`Created ${queriesToCreate.length} Queries...`);
    console.log('Data Imported!');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the function
importData();