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
    title: "Registration payment not reflecting",
    description: "I paid for the Space Nova workshop via UPI yesterday, but my dashboard still shows 'Payment Pending'. Transaction ID: UPI123456.",
    domain: "Payments"
  },
  {
    title: "Accommodation for team of 4",
    description: "We are coming from Delhi. Can we get a single room for 4 people in the guest house? Or do we have to stay in common dorms?",
    domain: "Hospitality"
  },
  {
    title: "Rocrun problem statement clarification",
    description: "In the rulebook for Rocrun, it says maximum thrust is 5N. Is this total thrust or thrust per motor?",
    domain: "Events"
  },
  {
    title: "Bus schedule from Kharagpur Station",
    description: "Will there be institute buses available from KGP station at 3 AM? Our train reaches late.",
    domain: "Transport"
  },
  {
    title: "Certificate issue",
    description: "I haven't received my participation certificate for the CAD workshop yet.",
    domain: "Certificates"
  },
  {
    title: "Team member replacement",
    description: "One of our team members fell sick. Can we swap him with another student for the Quiz competition?",
    domain: "Registration"
  },
  {
    title: "Mess food availability",
    description: "Is food included in the registration fee, or do we need to buy coupons separately at the mess?",
    domain: "Hospitality"
  },
  {
    title: "Hoverpod arena dimensions",
    description: "The rulebook mentions the arena is 10x10, but is it meters or feet? Please clarify.",
    domain: "Events"
  },
  {
    title: "Wifi access for guests",
    description: "Will guest wifi credentials be provided to participants for submitting code during the Hackathon?",
    domain: "Tech Support"
  },
  {
    title: "Refund request",
    description: "I mistakenly registered twice. Please refund the duplicate amount.",
    domain: "Payments"
  }
];

const POSSIBLE_ANSWERS = {
  "Payments": "We have verified your transaction. The status has been updated on your dashboard. Please check.",
  "Hospitality": "Accommodation is provided in student hostels on a shared basis. Guest house rooms are reserved for faculty.",
  "Events": "Please refer to version 2.0 of the rulebook uploaded on the website. It is total thrust.",
  "Transport": "Yes, NSSC buses will be running every hour from the station. Look for the NSSC banner.",
  "Registration": "Team swaps are allowed up to 24 hours before the event. Please mail the details to events@nssc.in.",
  "Tech Support": "Yes, temporary guest WiFi credentials will be handed out at the registration desk."
};

const DISMANTLE_REASONS = [
  "Duplicate query found.",
  "Question not relevant to NSSC.",
  "Incomplete information provided.",
  "Issue resolved automatically."
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
    for (let i = 0; i < 25; i++) {
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