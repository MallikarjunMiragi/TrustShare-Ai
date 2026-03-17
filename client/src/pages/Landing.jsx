import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import ItemCard from '../components/ItemCard';
import { featuredItems, trustHighlights } from '../data/mock';

const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <div className="space-y-20">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariant}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" /> Premium community sharing
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Borrow Instead of Buying
          </h1>
          <p className="text-lg text-slate-600">
            Share tools and resources inside your trusted community with a modern, transparent
            trust layer.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <AnimatedButton>Join Community</AnimatedButton>
            </Link>
            <Link to="/items">
              <button className="rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 shadow-glass">
                Explore Items
              </button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {trustHighlights.map((stat) => (
              <GlassCard key={stat.label} className="flex-1 min-w-[180px]">
                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.note}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="space-y-6"
        >
          <GlassCard className="space-y-4" floating>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Today’s shared highlight</p>
                <h3 className="text-xl font-semibold text-slate-900">Community Power Drill</h3>
              </div>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                Active
              </span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-white/70 to-indigo-100/70 p-6">
              <p className="text-sm text-slate-600">
                “Borrowed 14 times this month with a 100% on-time return rate.”
              </p>
            </div>
            <Link to="/items" className="flex items-center gap-2 text-sm font-semibold text-primary">
              View item <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredItems.slice(0, 2).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {[
          {
            title: 'How it works',
            body: 'Create or join a closed community, list items, and lend with confidence using invite-only access.',
          },
          {
            title: 'Trust-first sharing',
            body: 'Transparent trust scores, ratings, and return history make every transaction feel secure.',
          },
          {
            title: 'Sustainable habits',
            body: 'Reduce waste and save money by reusing what already exists inside your community.',
          },
        ].map((item) => (
          <GlassCard key={item.title} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.body}</p>
          </GlassCard>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Featured Shared Items</h2>
          <Link to="/items" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Ready to build trust in your community?</h2>
          <p className="text-sm text-slate-600">
            Launch TrustShareAI for your hostel, apartment, or campus today.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <AnimatedButton>Get Started</AnimatedButton>
            </Link>
            <button className="rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700">
              Talk to Us
            </button>
          </div>
        </GlassCard>
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Community statistics</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-between">
              <span>Average response time</span>
              <span className="font-semibold text-slate-900">27 mins</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Active lenders</span>
              <span className="font-semibold text-slate-900">418</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Request approval rate</span>
              <span className="font-semibold text-slate-900">94%</span>
            </li>
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}
