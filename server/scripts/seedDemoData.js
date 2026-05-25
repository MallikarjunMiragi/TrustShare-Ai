const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Community = require('../models/Community');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const Rating = require('../models/Rating');
const TrustHistory = require('../models/TrustHistory');
const TrustEvent = require('../models/TrustEvent');
const { recomputeTrustScore } = require('../utils/trust');

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'mallikarjunm.btech23@rvu.edu.in').toLowerCase();
const ADMIN_FALLBACK_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Demo@12345';
const FRIEND_PASSWORD = process.env.SEED_FRIEND_PASSWORD || 'Friends@123';
const COMMUNITY_NAME = process.env.SEED_COMMUNITY_NAME || 'RV University';
const FALLBACK_INVITE_CODE = process.env.SEED_INVITE_CODE || 'RVUAI26';
const LEGACY_DEMO_INVITE_CODE = 'DEMOAI2026';
const LEGACY_DEMO_DOMAIN = 'trustshare.demo';

const daysAgo = (days, hour = 10) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const friendUsers = [
  { key: 'aditya', name: 'Aditya Kulkarni', email: 'adityak.btech23@rvu.edu.in', idVerified: true, avatar: 'https://i.pravatar.cc/160?img=12', creditPoints: 130 },
  { key: 'nisha', name: 'Nisha Patil', email: 'nishap.btech23@rvu.edu.in', idVerified: true, avatar: 'https://i.pravatar.cc/160?img=32', creditPoints: 145 },
  { key: 'rahul', name: 'Rahul Shetty', email: 'rahuls.btech23@rvu.edu.in', idVerified: true, avatar: 'https://i.pravatar.cc/160?img=15', creditPoints: 110 },
  { key: 'sanjana', name: 'Sanjana Rao', email: 'sanjanar.btech23@rvu.edu.in', idVerified: true, avatar: 'https://i.pravatar.cc/160?img=44', creditPoints: 120 },
  { key: 'karthik', name: 'Karthik Reddy', email: 'karthikr.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=5', creditPoints: 65 },
  { key: 'sneha', name: 'Sneha Iyer', email: 'snehai.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=25', creditPoints: 20 },
  { key: 'vikram', name: 'Vikram Gowda', email: 'vikramg.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=8', creditPoints: 55 },
  { key: 'pooja', name: 'Pooja Hegde', email: 'poojah.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=38', creditPoints: -5, accountStatus: 'SUSPENDED' },
  { key: 'nikhil', name: 'Nikhil Jain', email: 'nikhilj.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=52', creditPoints: 10 },
  { key: 'fathima', name: 'Fathima Khan', email: 'fathimak.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=29', creditPoints: 40 },
  { key: 'arjun', name: 'Arjun Hegde', email: 'arjunh.btech23@rvu.edu.in', avatar: 'https://i.pravatar.cc/160?img=60', creditPoints: 0 },
];

const seededEmails = friendUsers.map((user) => user.email);

const itemSeeds = [
  { key: 'toolkit', owner: 'admin', title: 'Premium Repair Toolkit', category: 'Tools', valueTier: 'HIGH', description: 'Complete precision toolkit for hostel repairs and lab prototype work.' },
  { key: 'projector', owner: 'admin', title: 'Mini Projector', category: 'Electronics', valueTier: 'HIGH', description: 'Portable projector for seminars, club meetings, and movie nights.' },
  { key: 'extension', owner: 'admin', title: 'Extension Board', category: 'Electronics', valueTier: 'LOW', description: 'Six-port surge-protected extension board.' },
  { key: 'drill', owner: 'aditya', title: 'Cordless Drill', category: 'Tools', valueTier: 'MEDIUM', description: 'Rechargeable drill with bit set.' },
  { key: 'cycle', owner: 'aditya', title: 'Campus Bicycle', category: 'Transport', valueTier: 'HIGH', description: 'Well-maintained bicycle for nearby errands.' },
  { key: 'induction', owner: 'nisha', title: 'Induction Cooktop', category: 'Kitchen', valueTier: 'MEDIUM', description: 'Compact induction stove for short-term cooking.' },
  { key: 'camera', owner: 'nisha', title: 'Mirrorless Camera', category: 'Electronics', valueTier: 'HIGH', description: 'Camera kit for club events and project shoots.' },
  { key: 'gardenKit', owner: 'sanjana', title: 'Balcony Gardening Kit', category: 'Home', valueTier: 'MEDIUM', description: 'Starter kit with tools, gloves, and sprayer.' },
  { key: 'firstAid', owner: 'sanjana', title: 'First Aid Box', category: 'Health', valueTier: 'LOW', description: 'Shared emergency first-aid supplies.' },
  { key: 'whiteboard', owner: 'karthik', title: 'Study Whiteboard', category: 'Study', valueTier: 'LOW', description: 'Portable whiteboard for group study.' },
  { key: 'hdmi', owner: 'karthik', title: 'HDMI Cable', category: 'Electronics', valueTier: 'LOW', description: 'Long HDMI cable for presentations.' },
  { key: 'powerbank', owner: 'karthik', title: 'Power Bank', category: 'Electronics', valueTier: 'LOW', description: '10000mAh backup battery.' },
  { key: 'controller', owner: 'karthik', title: 'Game Controller', category: 'Entertainment', valueTier: 'LOW', description: 'Bluetooth game controller.' },
  { key: 'kettle', owner: 'sneha', title: 'Electric Kettle', category: 'Kitchen', valueTier: 'LOW', description: 'Quick kettle for tea and noodles.' },
  { key: 'laptopStand', owner: 'rahul', title: 'Laptop Stand', category: 'Study', valueTier: 'LOW', description: 'Foldable aluminium laptop stand.' },
  { key: 'printer', owner: 'fathima', title: 'Compact Printer', category: 'Study', valueTier: 'MEDIUM', description: 'Printer for assignments and forms.' },
  { key: 'tripod', owner: 'fathima', title: 'Camera Tripod', category: 'Electronics', valueTier: 'MEDIUM', description: 'Stable tripod for content and project demos.' },
];

const requestSeeds = [
  { item: 'drill', borrower: 'nisha', status: 'RETURNED', requestedDaysAgo: 70, durationDays: 5, decisionDelayHours: 3, returnOffsetDays: -1, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'toolkit', borrower: 'nisha', status: 'RETURNED', requestedDaysAgo: 58, durationDays: 4, decisionDelayHours: 4, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'camera', borrower: 'rahul', status: 'RETURNED', requestedDaysAgo: 52, durationDays: 3, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'cycle', borrower: 'rahul', status: 'RETURNED', requestedDaysAgo: 41, durationDays: 6, decisionDelayHours: 5, returnOffsetDays: -1, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'induction', borrower: 'aditya', status: 'RETURNED', requestedDaysAgo: 37, durationDays: 4, decisionDelayHours: 6, returnOffsetDays: 0, ownerScore: 5, ownerCare: 4, borrowerScore: 5 },
  { item: 'gardenKit', borrower: 'admin', status: 'RETURNED', requestedDaysAgo: 30, durationDays: 5, decisionDelayHours: 2, returnOffsetDays: -1, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'extension', borrower: 'sanjana', status: 'RETURNED', requestedDaysAgo: 26, durationDays: 3, decisionDelayHours: 1, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'projector', borrower: 'sanjana', status: 'RETURNED', requestedDaysAgo: 20, durationDays: 2, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'drill', borrower: 'sneha', status: 'RETURNED', requestedDaysAgo: 24, durationDays: 3, decisionDelayHours: 5, returnOffsetDays: 4, ownerScore: 2, ownerCare: 2, borrowerScore: 4 },
  { item: 'extension', borrower: 'sneha', status: 'RETURNED', requestedDaysAgo: 15, durationDays: 2, decisionDelayHours: 4, returnOffsetDays: 2, ownerScore: 3, ownerCare: 3, borrowerScore: 5 },
  { item: 'camera', borrower: 'sneha', status: 'ACTIVE', requestedDaysAgo: 12, durationDays: 4, decisionDelayHours: 8 },
  { item: 'whiteboard', borrower: 'vikram', status: 'RETURNED', requestedDaysAgo: 35, durationDays: 2, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'hdmi', borrower: 'vikram', status: 'RETURNED', requestedDaysAgo: 29, durationDays: 2, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'powerbank', borrower: 'vikram', status: 'RETURNED', requestedDaysAgo: 22, durationDays: 3, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'controller', borrower: 'vikram', status: 'RETURNED', requestedDaysAgo: 16, durationDays: 2, decisionDelayHours: 2, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 5 },
  { item: 'projector', borrower: 'pooja', status: 'RETURNED', requestedDaysAgo: 45, durationDays: 2, decisionDelayHours: 7, returnOffsetDays: 6, ownerScore: 1, ownerCare: 1, borrowerScore: 4 },
  { item: 'cycle', borrower: 'pooja', status: 'ACTIVE', requestedDaysAgo: 11, durationDays: 3, decisionDelayHours: 12 },
  { item: 'printer', borrower: 'nikhil', status: 'PENDING', requestedDaysAgo: 2, durationDays: 5 },
  { item: 'tripod', borrower: 'nikhil', status: 'PENDING', requestedDaysAgo: 1, durationDays: 3 },
  { item: 'printer', borrower: 'admin', status: 'RETURNED', requestedDaysAgo: 66, durationDays: 4, decisionDelayHours: 120, returnOffsetDays: 0, ownerScore: 5, ownerCare: 5, borrowerScore: 3 },
  { item: 'tripod', borrower: 'aditya', status: 'REJECTED', requestedDaysAgo: 9, durationDays: 3, decisionDelayHours: 168 },
  { item: 'firstAid', borrower: 'fathima', status: 'RETURNED', requestedDaysAgo: 18, durationDays: 2, decisionDelayHours: 6, returnOffsetDays: 0, ownerScore: 4, ownerCare: 4, borrowerScore: 5 },
];

const dropLegacyRatingIndexes = async () => {
  const indexes = await Rating.collection.indexes();
  const legacyIndexes = indexes.filter((index) => {
    const keys = Object.keys(index.key || {});
    return keys.includes('borrowRequest') || keys.includes('reviewer');
  });

  for (const index of legacyIndexes) {
    if (index.name === '_id_') continue;
    await Rating.collection.dropIndex(index.name);
    console.log(`Dropped legacy ratings index: ${index.name}`);
  }
};

const resolveCommunity = async () => {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  let community = admin?.communityId ? await Community.findById(admin.communityId) : null;

  if (!community) {
    community = await Community.findOne({ name: COMMUNITY_NAME });
  }

  if (!admin) {
    const password = await bcrypt.hash(ADMIN_FALLBACK_PASSWORD, 10);
    admin = await User.create({
      name: 'Mallikarjun Miragi BTech 23',
      email: ADMIN_EMAIL,
      password,
      avatar: 'https://i.pravatar.cc/160?img=68',
      creditPoints: 160,
      verification: {
        emailVerified: true,
        communityVerified: Boolean(community),
        idVerified: true,
      },
    });
  }

  if (!community) {
    community = await Community.create({
      name: COMMUNITY_NAME,
      adminId: admin._id,
      inviteCode: FALLBACK_INVITE_CODE,
      members: [admin._id],
    });
  }

  community.adminId = admin._id;
  if (!community.members.some((memberId) => memberId.toString() === admin._id.toString())) {
    community.members.push(admin._id);
  }
  await community.save();

  admin.communityId = community._id;
  admin.verification = {
    ...(admin.verification || {}),
    emailVerified: true,
    communityVerified: true,
  };
  await admin.save();

  return { admin, community };
};

const cleanupOldSeedData = async (community) => {
  const legacyCommunity = await Community.findOne({ inviteCode: LEGACY_DEMO_INVITE_CODE });
  const seedUsers = await User.find({
    $or: [
      { email: { $in: seededEmails } },
      { email: { $regex: `@${LEGACY_DEMO_DOMAIN}$`, $options: 'i' } },
    ],
  }).select('_id email');

  const removableUserIds = seedUsers.map((user) => user._id);
  const seededItemTitles = itemSeeds.map((item) => item.title);
  const itemFilter = {
    $or: [
      { ownerId: { $in: removableUserIds } },
      { title: { $in: seededItemTitles }, communityId: community._id },
    ],
  };
  if (legacyCommunity) {
    itemFilter.$or.push({ communityId: legacyCommunity._id });
  }

  const items = await Item.find(itemFilter).select('_id');
  const itemIds = items.map((item) => item._id);
  const requests = await BorrowRequest.find({
    $or: [
      { borrowerId: { $in: removableUserIds } },
      { ownerId: { $in: removableUserIds } },
      { itemId: { $in: itemIds } },
    ],
  }).select('_id');
  const requestIds = requests.map((request) => request._id);

  await Rating.deleteMany({
    $or: [
      { fromUserId: { $in: removableUserIds } },
      { toUserId: { $in: removableUserIds } },
      { borrowRequestId: { $in: requestIds } },
    ],
  });
  await TrustHistory.deleteMany({ userId: { $in: removableUserIds } });
  await TrustEvent.deleteMany({ userId: { $in: removableUserIds } });
  await BorrowRequest.deleteMany({ _id: { $in: requestIds } });
  await Item.deleteMany({ _id: { $in: itemIds } });
  await User.deleteMany({ _id: { $in: removableUserIds } });

  if (removableUserIds.length) {
    await Community.updateMany(
      { members: { $in: removableUserIds } },
      { $pull: { members: { $in: removableUserIds } } }
    );
  }
  if (legacyCommunity) {
    await Community.deleteOne({ _id: legacyCommunity._id });
  }
};

const seedFriends = async (community) => {
  const password = await bcrypt.hash(FRIEND_PASSWORD, 10);
  const usersByKey = {};

  for (const profile of friendUsers) {
    const user = await User.create({
      name: profile.name,
      email: profile.email,
      password,
      avatar: profile.avatar,
      communityId: community._id,
      creditPoints: profile.creditPoints,
      accountStatus: profile.accountStatus || 'ACTIVE',
      verification: {
        emailVerified: true,
        communityVerified: true,
        idVerified: Boolean(profile.idVerified),
      },
    });
    usersByKey[profile.key] = user;
  }

  community.members = [
    ...new Set([
      ...community.members.map((memberId) => memberId.toString()),
      ...Object.values(usersByKey).map((user) => user._id.toString()),
    ]),
  ];
  await community.save();

  return usersByKey;
};

const seedItems = async (community, usersByKey) => {
  const itemsByKey = {};

  for (const itemSeed of itemSeeds) {
    const owner = usersByKey[itemSeed.owner];
    const item = await Item.create({
      title: itemSeed.title,
      description: itemSeed.description,
      category: itemSeed.category,
      valueTier: itemSeed.valueTier,
      ownerId: owner._id,
      communityId: community._id,
      imageUrl: '',
      available: true,
    });
    itemsByKey[itemSeed.key] = item;
  }

  return itemsByKey;
};

const createTrustEvent = async ({ userId, type, label, date, meta = {} }) => {
  await TrustEvent.create({
    userId,
    type,
    label,
    meta,
    createdAt: date || new Date(),
  });
};

const seedRequestsAndRatings = async (usersByKey, itemsByKey) => {
  const summary = {
    createdRequests: 0,
    returnedRequests: 0,
    activeRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
  };

  for (const seed of requestSeeds) {
    const item = itemsByKey[seed.item];
    const borrower = usersByKey[seed.borrower];
    const owner = usersByKey[itemSeeds.find((entry) => entry.key === seed.item).owner];
    const requestedAt = daysAgo(seed.requestedDaysAgo);
    const approvedAt = ['ACTIVE', 'RETURNED'].includes(seed.status)
      ? addHours(requestedAt, seed.decisionDelayHours || 2)
      : undefined;
    const rejectedAt = seed.status === 'REJECTED'
      ? addHours(requestedAt, seed.decisionDelayHours || 24)
      : undefined;
    const dueAt = approvedAt && seed.durationDays ? addDays(approvedAt, seed.durationDays) : undefined;
    const returnedAt = seed.status === 'RETURNED'
      ? addDays(dueAt || approvedAt || requestedAt, seed.returnOffsetDays || 0)
      : undefined;

    const request = await BorrowRequest.create({
      itemId: item._id,
      borrowerId: borrower._id,
      ownerId: owner._id,
      durationDays: seed.durationDays || null,
      message: seed.message || `Can I borrow ${item.title} for project work?`,
      status: seed.status,
      requestedAt,
      approvedAt,
      rejectedAt,
      dueAt,
      returnedAt,
    });

    summary.createdRequests += 1;
    if (seed.status === 'RETURNED') summary.returnedRequests += 1;
    if (seed.status === 'ACTIVE') summary.activeRequests += 1;
    if (seed.status === 'PENDING') summary.pendingRequests += 1;
    if (seed.status === 'REJECTED') summary.rejectedRequests += 1;

    if (seed.status === 'ACTIVE') {
      item.available = false;
      await item.save();
    }

    if (seed.status === 'RETURNED') {
      await Rating.create({
        fromUserId: owner._id,
        toUserId: borrower._id,
        borrowRequestId: request._id,
        score: seed.ownerScore || 4,
        careScore: seed.ownerCare || seed.ownerScore || 4,
        comment: seed.ownerComment || 'Returned with clear communication.',
        createdAt: addHours(returnedAt, 5),
      });

      await Rating.create({
        fromUserId: borrower._id,
        toUserId: owner._id,
        borrowRequestId: request._id,
        score: seed.borrowerScore || 4,
        careScore: seed.borrowerCare || seed.borrowerScore || 4,
        comment: seed.borrowerComment || 'Owner was helpful and responsive.',
        createdAt: addHours(returnedAt, 8),
      });

      const daysLate = dueAt && returnedAt > dueAt
        ? Math.ceil((returnedAt - dueAt) / (1000 * 60 * 60 * 24))
        : 0;
      await createTrustEvent({
        userId: borrower._id,
        type: daysLate ? 'LATE_RETURN' : 'RETURNED_ON_TIME',
        label: daysLate ? `Late return (${daysLate} days)` : `Returned ${item.title} on time`,
        date: returnedAt,
        meta: { itemId: item._id, requestId: request._id, daysLate },
      });
    }

    if (seed.status === 'ACTIVE' && dueAt && dueAt < new Date()) {
      await createTrustEvent({
        userId: borrower._id,
        type: 'ACTIVE_OVERDUE',
        label: `Overdue active borrow: ${item.title}`,
        date: dueAt,
        meta: { itemId: item._id, requestId: request._id },
      });
    }

    if (seed.status === 'REJECTED') {
      await createTrustEvent({
        userId: borrower._id,
        type: 'REQUEST_REJECTED',
        label: `Request rejected for ${item.title}`,
        date: rejectedAt,
        meta: { itemId: item._id, requestId: request._id },
      });
    }
  }

  return summary;
};

const recomputeAllUsers = async (usersByKey) => {
  const results = [];

  for (const user of Object.values(usersByKey)) {
    const profile = await recomputeTrustScore(user._id);
    const refreshed = await User.findById(user._id).select('name email accountStatus creditPoints');
    results.push({
      name: refreshed.name,
      email: refreshed.email,
      accountStatus: refreshed.accountStatus,
      creditPoints: refreshed.creditPoints,
      trustScore: profile.trustScore,
      trustTier: profile.trustTier,
      flags: profile.breakdown.flags.map((flag) => flag.code).join(', ') || 'none',
    });
  }

  return results.sort((a, b) => b.trustScore - a.trustScore);
};

const main = async () => {
  await connectDB();
  await dropLegacyRatingIndexes();
  const { admin, community } = await resolveCommunity();
  await cleanupOldSeedData(community);

  const friendUsersByKey = await seedFriends(community);
  const usersByKey = { admin, ...friendUsersByKey };
  const itemsByKey = await seedItems(community, usersByKey);
  const requestSummary = await seedRequestsAndRatings(usersByKey, itemsByKey);
  const trustResults = await recomputeAllUsers(usersByKey);

  console.log('\nRV University seed data created successfully');
  console.log(`Community: ${community.name}`);
  console.log(`Invite code: ${community.inviteCode}`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
  console.log(`Friend account password: ${FRIEND_PASSWORD}`);
  console.log(`Users seeded/updated: ${trustResults.length}`);
  console.log(`Items: ${Object.keys(itemsByKey).length}`);
  console.log(`Requests: ${requestSummary.createdRequests}`);
  console.log(`Returned: ${requestSummary.returnedRequests}`);
  console.log(`Active: ${requestSummary.activeRequests}`);
  console.log(`Pending: ${requestSummary.pendingRequests}`);
  console.log(`Rejected: ${requestSummary.rejectedRequests}\n`);

  console.table(
    trustResults.map((user) => ({
      name: user.name,
      email: user.email,
      status: user.accountStatus,
      trust: user.trustScore,
      tier: user.trustTier,
      flags: user.flags,
    }))
  );
};

main()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
