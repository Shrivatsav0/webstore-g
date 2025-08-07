import {
  Truck,
  Shield,
  Headphones,
  Heart,
  Users,
  ShoppingBag,
  TrendingUp,
  Gift,
  Zap,
  User,
  ShoppingCart,
  Home,
  Store,
  Crown,
  LifeBuoy,
} from "lucide-react";

// Money helper
export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/* =========================
     Core Types
     ========================= */

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  image: string; // primary image
  tags: string[];
  rating: number; // 0-5
  inStock: boolean;
  slug?: string;
  discountPercent?: number; // optional: for badges
  gallery?: string[]; // additional images
  features?: string[]; // short bullet highlights
  details?: { label: string; value: string }[]; // key-value specs
  delivery?: string; // product-specific delivery note
  requirements?: string[]; // prerequisites
  whatsIncluded?: string[]; // explicit inclusions
  disclaimer?: string; // small print
  inventoryNote?: string; // stock/status or upgrade note
};

export type CategoryItem = {
  id: string;
  title: string;
  description: string;
  image: string; // URL or /public path
  badge?: string;
  href?: string;
  count?: number; // optional: number of items/products
};

// Category with owned products and optional sections
export type CategoryFull = {
  id: string;
  slug: string; // url key
  title: string;
  description: string;
  image: string; // hero/image banner
  badge?: string;
  products?: Product[]; // flat list
  sections?: {
    id: string;
    title: string;
    description?: string;
    products: Product[];
  }[];
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  products?: Product[];
  sections?: {
    id: string;
    title: string;
    description?: string;
    products: Product[];
  }[];
};

/* =========================
     Site / Marketing Data
     ========================= */

export const siteConfig = {
  name: "BlockShop",
  description:
    "Your trusted Minecraft server shop for ranks, keys, and exclusive perks!",
  logo: ShoppingBag,
  url: "https://blockshop.example.com",
};

export const heroData = {
  badge: {
    text: "New Crate Keys Released",
    icon: Zap,
  },
  title: "Upgrade Your",
  subtitle: "Minecraft Adventure",
  description:
    "Unlock exclusive ranks, crate keys, and perks to enhance your gameplay. Support the server and stand out from the crowd!",
  buttons: {
    primary: "Browse Shop",
    secondary: "Support",
    primaryHref: "/categories",
    secondaryHref: "/support",
  },
  helperLinks: [
    { label: "How it works", href: "/support#how-it-works" },
    { label: "Payment methods", href: "/support#payments" },
  ],
};

export const features = [
  {
    icon: Truck,
    title: "Instant Delivery",
    description: "Items delivered instantly after purchase",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and trusted payment processing",
  },
  {
    icon: Headphones,
    title: "Active Support",
    description: "Need help? Our team is here for you",
  },
  {
    icon: Heart,
    title: "Player Rewards",
    description: "Get bonus rewards for supporting the server",
  },
];

export const categories = [
  {
    title: "Ranks",
    description: "Unlock special abilities and commands",
    image: "/placeholder.svg?height=480&width=720&text=Ranks",
    badge: "Popular",
    cta: { label: "Explore", href: "/ranks" },
  },
  {
    title: "Crate Keys",
    description: "Open crates for random rewards",
    image: "/placeholder.svg?height=480&width=720&text=Crate%20Keys",
    badge: "New",
    cta: { label: "Open Now", href: "/shop?category=keys" },
  },
  {
    title: "Cosmetics",
    description: "Show off with pets, trails, and more",
    image: "/placeholder.svg?height=480&width=720&text=Cosmetics",
    badge: "Trending",
    cta: { label: "Style Up", href: "/shop?category=cosmetics" },
  },
];

export const stats = [
  { icon: Users, number: "20K+", label: "Players Served" },
  { icon: ShoppingBag, number: "5K+", label: "Orders Completed" },
  { icon: TrendingUp, number: "98%", label: "Positive Feedback" },
  { icon: Gift, number: "24/7", label: "Support Available" },
];

export const testimonials = [
  {
    name: "AlexCraft",
    role: "VIP Player",
    content:
      "Bought a rank and got it instantly! The perks are awesome and support is super helpful.",
    rating: 5,
  },
  {
    name: "PixelMiner",
    role: "Regular Customer",
    content:
      "Crate keys are so much fun! Got some rare loot and the process was smooth.",
    rating: 5,
  },
  {
    name: "BlockBuilder",
    role: "Server Supporter",
    content:
      "Love the cosmetics! Pets and trails make my character stand out. Highly recommend.",
    rating: 5,
  },
];

export const newsletter = {
  title: "Stay in the Loop",
  description: "Get updates on new items, sales, and server events",
  placeholder: "Enter your email",
  button: "Subscribe",
  disclaimer: "No spam, unsubscribe anytime",
  successMessage: "Thanks! Please check your inbox to confirm.",
  errorMessage: "Something went wrong. Try again later.",
};

export const footerData = {
  description:
    "BlockShop – your trusted Minecraft server shop for ranks, keys, and more.",
  sections: [
    {
      title: "Quick Links",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "FAQ", href: "/support#faq" },
        { label: "Support", href: "/support" },
      ],
    },
    {
      title: "Categories",
      links: [
        { label: "Ranks", href: "/ranks" },
        { label: "Crate Keys", href: "/shop?category=keys" },
        { label: "Cosmetics", href: "/shop?category=cosmetics" },
        { label: "Boosters", href: "/shop?category=boosters" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/support" },
        { label: "Refund Policy", href: "/legal/refund-policy" },
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Terms of Service", href: "/legal/terms" },
      ],
    },
  ],
  copyright: "© 2025 BlockShop. All rights reserved.",
  poweredBy: "Powered by Minecraft & modern web tech",
  social: [
    { label: "Discord", href: "https://discord.gg/your-server" },
    { label: "Twitter", href: "https://twitter.com/your-handle" },
  ],
};

export const userMenuData = {
  signInText: "Sign In",
  signOutText: "Sign Out",
  mockUser: {
    name: "Steve",
    email: "steve@minecraft.net",
    avatarUrl: "/placeholder.svg?height=64&width=64&text=S",
  },
  menuItems: [
    { label: "Profile", href: "/profile", icon: User },
    { label: "My Purchases", href: "/orders", icon: ShoppingCart },
  ],
};

/* =========================
     Global Products (legacy/simple list)
     ========================= */

export const Products: Product[] = [
  {
    id: "p-1",
    name: "VIP Rank",
    description:
      "Unlock exclusive commands, colored chat, and a VIP prefix. Show your support and stand out!",
    price: 999,
    image: "/placeholder.svg?height=480&width=720&text=VIP%20Rank",
    tags: ["rank", "vip", "perks"],
    rating: 4.9,
    inStock: true,
    slug: "vip-rank",
    discountPercent: 10,
  },
  {
    id: "p-2",
    name: "Legendary Crate Key",
    description:
      "Open the Legendary Crate for a chance at rare items, gear, and more. Delivered instantly!",
    price: 499,
    image: "/placeholder.svg?height=480&width=720&text=Legendary%20Key",
    tags: ["crate", "key", "loot"],
    rating: 4.7,
    inStock: true,
    slug: "legendary-crate-key",
  },
  {
    id: "p-3",
    name: "Pet Wolf",
    description:
      "Summon a loyal wolf companion to follow you around the server. Cosmetic only.",
    price: 299,
    image: "/placeholder.svg?height=480&width=720&text=Pet%20Wolf",
    tags: ["cosmetic", "pet", "wolf"],
    rating: 4.8,
    inStock: true,
    slug: "pet-wolf",
  },
  {
    id: "p-4",
    name: "Fly Perk (30 Days)",
    description:
      "Gain the ability to fly anywhere on the server for 30 days. Perfect for builders!",
    price: 799,
    image: "/placeholder.svg?height=480&width=720&text=Fly%20Perk",
    tags: ["perk", "fly", "builder"],
    rating: 4.6,
    inStock: true,
    slug: "fly-perk-30-days",
  },
];

/* =========================
     Categories Index (for landing sections)
     ========================= */

export const categoryItems: CategoryItem[] = [
  {
    id: "cat-ranks",
    title: "Ranks",
    description: "Unlock special abilities and powerful commands.",
    image: "/placeholder.svg?height=480&width=720&text=Ranks",
    badge: "Popular",
    href: "/categories/ranks",
    count: 12,
  },
  {
    id: "cat-keys",
    title: "Crate Keys",
    description: "Open crates for random rewards and rare loot.",
    image: "/placeholder.svg?height=480&width=720&text=Crate%20Keys",
    badge: "New",
    href: "/categories/crate-keys",
    count: 8,
  },
  {
    id: "cat-cosmetics",
    title: "Cosmetics",
    description: "Pets, trails, emotes—style your gameplay.",
    image: "/placeholder.svg?height=480&width=720&text=Cosmetics",
    badge: "Trending",
    href: "/categories/cosmetics",
    count: 16,
  },
  {
    id: "cat-boosters",
    title: "Boosters",
    description: "Multiply your XP, money, or drops for a limited time.",
    image: "/placeholder.svg?height=480&width=720&text=Boosters",
    badge: "Hot",
    href: "/categories/boosters",
    count: 5,
  },
  {
    id: "cat-perks",
    title: "Perks",
    description: "Permanent or timed abilities like /fly, /nick, and more.",
    image: "/placeholder.svg?height=480&width=720&text=Perks",
    badge: "Exclusive",
    href: "/categories/perks",
    count: 7,
  },
  {
    id: "cat-bundles",
    title: "Bundles",
    description: "Get more for less with our value packs and bundles.",
    image: "/placeholder.svg?height=480&width=720&text=Bundles",
    badge: "Value",
    href: "/categories/bundles",
    count: 4,
  },
  {
    id: "cat-pets",
    title: "Pets",
    description: "Adopt a loyal companion to follow you on your adventures.",
    image: "/placeholder.svg?height=480&width=720&text=Pets",
    badge: "Cute",
    href: "/categories/pets",
    count: 10,
  },
  {
    id: "cat-titles",
    title: "Titles",
    description: "Show off unique chat titles and tags.",
    image: "/placeholder.svg?height=480&width=720&text=Titles",
    badge: "Showcase",
    href: "/categories/titles",
    count: 6,
  },
  {
    id: "cat-misc",
    title: "Miscellaneous",
    description: "Fun extras, gadgets, and surprises.",
    image: "/placeholder.svg?height=480&width=720&text=Miscellaneous",
    badge: "Fun",
    href: "/categories/misc",
    count: 9,
  },
];

/* =========================
     Category-Specific Data (owns products/sections)
     ========================= */

export const categoriesFull: CategoryFull[] = [
  {
    id: "c-ranks",
    slug: "ranks",
    title: "Ranks",
    description:
      "Unlock powerful commands, perks, and a shiny prefix that sets you apart.",
    image: "/placeholder.svg?height=560&width=1200&text=Ranks",
    badge: "Popular",
    products: [
      {
        id: "rank-vip",
        slug: "vip",
        name: "VIP",
        description:
          "Entry rank with colored chat, basic kits, and VIP prefix.",
        price: 999,
        image: "/placeholder.svg?height=480&width=720&text=VIP",
        tags: ["rank", "vip", "perks"],
        rating: 4.8,
        inStock: true,
        discountPercent: 10,
        gallery: [
          "/placeholder.svg?height=480&width=720&text=VIP",
          "/placeholder.svg?height=320&width=480&text=VIP+Kits",
        ],
        features: ["Colored chat", "VIP prefix", "Basic VIP kit", "2 homes"],
        details: [
          { label: "Type", value: "Rank (permanent)" },
          { label: "Compatibility", value: "All survival servers" },
          { label: "Upgrade path", value: "VIP+ → MVP" },
        ],
        delivery: "Granted instantly after purchase. Relog if not visible.",
        requirements: ["Valid Minecraft username"],
        whatsIncluded: ["VIP permissions", "Prefix", "VIP kit"],
        disclaimer:
          "Perks are cosmetic/quality-of-life oriented. Balance may change over seasons.",
        inventoryNote: "Upgrades pro-rate at checkout",
      },
      {
        id: "rank-vip-plus",
        slug: "vip-plus",
        name: "VIP+",
        description:
          "All VIP perks plus extra homes, bigger kits, and priority queue.",
        price: 1499,
        image: "/placeholder.svg?height=480&width=720&text=VIP%2B",
        tags: ["rank", "vip+", "perks"],
        rating: 4.9,
        inStock: true,
        gallery: [
          "/placeholder.svg?height=480&width=720&text=VIP%2B",
          "/placeholder.svg?height=320&width=480&text=Priority+Queue",
        ],
        features: ["Priority queue", "Larger kits", "4 homes"],
        details: [
          { label: "Type", value: "Rank (permanent)" },
          { label: "Upgrade path", value: "MVP" },
        ],
        delivery: "Instant delivery on purchase.",
        whatsIncluded: ["VIP+ permissions", "Prefix", "Expanded kits"],
      },
      {
        id: "rank-mvp",
        slug: "mvp",
        name: "MVP",
        description:
          "Expanded permissions, larger kits, and exclusive cosmetics access.",
        price: 2499,
        image: "/placeholder.svg?height=480&width=720&text=MVP",
        tags: ["rank", "mvp"],
        rating: 4.7,
        inStock: true,
        features: ["Exclusive cosmetics access", "6 homes", "Bigger kits"],
        details: [
          { label: "Type", value: "Rank (permanent)" },
          { label: "Best for", value: "Players active across seasons" },
        ],
        delivery: "Instant. Relog to refresh permissions.",
        whatsIncluded: [
          "MVP permissions",
          "Prefix",
          "Exclusive cosmetics access",
        ],
      },
    ],
  },
  {
    id: "c-cosmetics",
    slug: "cosmetics",
    title: "Cosmetics",
    description:
      "Style your gameplay with pets, hats, trails, and special effects.",
    image: "/placeholder.svg?height=560&width=1200&text=Cosmetics",
    badge: "Trending",
    sections: [
      {
        id: "sec-hats",
        title: "Hats",
        description: "Collectible hats to top off your look.",
        products: [
          {
            id: "hat-top-hat",
            slug: "top-hat",
            name: "Top Hat",
            description: "A classy black top hat. Pure style.",
            price: 299,
            image: "/placeholder.svg?height=480&width=720&text=Top%20Hat",
            tags: ["cosmetic", "hat"],
            rating: 4.6,
            inStock: true,
            features: ["Cosmetic only", "Lobby compatible", "Toggle anytime"],
            details: [
              { label: "Slot", value: "Hat" },
              { label: "Rarity", value: "Rare" },
            ],
            whatsIncluded: ["Top Hat cosmetic"],
            disclaimer: "No gameplay advantage.",
          },
        ],
      },
      {
        id: "sec-effects",
        title: "Effects",
        description: "Trails and auras that follow you around.",
        products: [
          {
            id: "effect-ember-trail",
            slug: "ember-trail",
            name: "Ember Trail",
            description: "Fiery particles trailing your steps.",
            price: 399,
            image: "/placeholder.svg?height=480&width=720&text=Ember%20Trail",
            tags: ["cosmetic", "effect", "trail"],
            rating: 4.7,
            inStock: true,
            features: [
              "Cosmetic only",
              "Toggle with /effects",
              "Low performance impact",
            ],
            details: [
              { label: "Type", value: "Particle trail" },
              { label: "Color", value: "Warm orange" },
            ],
            whatsIncluded: ["Ember Trail cosmetic"],
            disclaimer: "No gameplay advantage.",
          },
          {
            id: "effect-ice-aura",
            slug: "ice-aura",
            name: "Ice Aura",
            description: "A frosty aura that shimmers around you.",
            price: 449,
            image: "/placeholder.svg?height=480&width=720&text=Ice%20Aura",
            tags: ["cosmetic", "effect", "aura"],
            rating: 4.5,
            inStock: true,
          },
        ],
      },
    ],
  },
  {
    id: "c-keys",
    slug: "crate-keys",
    title: "Crate Keys",
    description:
      "Open special crates for a chance at rare loot, gear, and surprises.",
    image: "/placeholder.svg?height=560&width=1200&text=Crate%20Keys",
    badge: "New",
    products: [
      {
        id: "key-legendary",
        slug: "legendary-key",
        name: "Legendary Key",
        description:
          "Unlock the Legendary Crate—your best chance at rare items.",
        price: 499,
        image: "/placeholder.svg?height=480&width=720&text=Legendary%20Key",
        tags: ["crate", "key", "loot"],
        rating: 4.7,
        inStock: true,
        gallery: [
          "/placeholder.svg?height=480&width=720&text=Legendary%20Key",
          "/placeholder.svg?height=320&width=480&text=Crate+Room",
        ],
        features: ["Top-tier rewards", "Instant delivery", "Tradeable in-game"],
        details: [
          { label: "Crate", value: "Legendary" },
          { label: "Tier", value: "S" },
          { label: "Use at", value: "/warp crates" },
        ],
        delivery: "Key is added to your account instantly.",
        whatsIncluded: ["1x Legendary Crate Key"],
        disclaimer: "Rewards are randomized. No specific item is guaranteed.",
      },
      {
        id: "key-epic-bundle",
        slug: "epic-key-bundle",
        name: "Epic Key Bundle (5x)",
        description: "Five Epic Keys at a discount.",
        price: 1799,
        image: "/placeholder.svg?height=480&width=720&text=Epic%20Bundle",
        tags: ["crate", "key", "bundle"],
        rating: 4.6,
        inStock: true,
        discountPercent: 10,
        features: ["Bundle value", "Instant delivery"],
        details: [
          { label: "Includes", value: "5x Epic Crate Keys" },
          { label: "Use at", value: "/warp crates" },
        ],
        delivery: "Keys are added to your account instantly.",
        whatsIncluded: ["5x Epic Crate Keys"],
        disclaimer: "Rewards are randomized per key.",
      },
      {
        id: "key-rare",
        slug: "rare-key",
        name: "Rare Key",
        description: "Open the Rare Crate for solid mid-tier rewards.",
        price: 299,
        image: "/placeholder.svg?height=480&width=720&text=Rare%20Key",
        tags: ["crate", "key"],
        rating: 4.5,
        inStock: true,
        features: ["Good value", "Instant delivery"],
        details: [
          { label: "Crate", value: "Rare" },
          { label: "Tier", value: "B" },
        ],
        delivery: "Key is added instantly.",
        whatsIncluded: ["1x Rare Crate Key"],
        disclaimer: "Rewards are randomized.",
      },
    ],
  },
  {
    id: "c-boosters",
    slug: "boosters",
    title: "Boosters",
    description: "Speed up your progression with timed global boosters.",
    image: "/placeholder.svg?height=560&width=1200&text=Boosters",
    products: [
      {
        id: "booster-xp-2h",
        slug: "xp-booster-2h",
        name: "XP Booster (2h)",
        description: "Double XP for 2 hours server-wide.",
        price: 799,
        image: "/placeholder.svg?height=480&width=720&text=XP%20Booster",
        tags: ["booster", "xp"],
        rating: 4.4,
        inStock: true,
        features: ["2h duration", "Server-wide effect", "Stacks with events"],
        details: [
          { label: "Multiplier", value: "2x XP" },
          { label: "Duration", value: "2 hours" },
        ],
        delivery: "Activated instantly after purchase or scheduling.",
        disclaimer: "Booster times may be adjusted during maintenance windows.",
      },
      {
        id: "booster-drops-24h",
        slug: "drops-booster-24h",
        name: "Drops Booster (24h)",
        description: "Increased drop rates for everyone for 24 hours.",
        price: 1399,
        image: "/placeholder.svg?height=480&width=720&text=Drops%20Booster",
        tags: ["booster", "drops"],
        rating: 4.6,
        inStock: true,
        discountPercent: 15,
        features: ["24h duration", "Server-wide effect"],
        details: [
          { label: "Effect", value: "Increased drop rates" },
          { label: "Duration", value: "24 hours" },
        ],
        delivery: "Activated instantly after purchase or scheduling.",
      },
      {
        id: "booster-money-12h",
        slug: "money-booster-12h",
        name: "Money Booster (12h)",
        description: "Earn extra in-game currency for a limited time.",
        price: 999,
        image: "/placeholder.svg?height=480&width=720&text=Money%20Booster",
        tags: ["booster", "money"],
        rating: 4.3,
        inStock: true,
        features: ["12h duration", "Server-wide effect"],
        details: [
          { label: "Effect", value: "Increased earnings" },
          { label: "Duration", value: "12 hours" },
        ],
        delivery: "Activated instantly after purchase or scheduling.",
      },
    ],
  },
  {
    id: "c-perks",
    slug: "perks",
    title: "Perks",
    description:
      "Permanent or timed abilities like /fly, /nick, and more to enhance gameplay.",
    image: "/placeholder.svg?height=560&width=1200&text=Perks",
    products: [
      {
        id: "perk-fly-30d",
        slug: "fly-30-days",
        name: "Fly Perk (30 Days)",
        description: "Enable /fly server-wide for 30 days.",
        price: 799,
        image: "/placeholder.svg?height=480&width=720&text=Fly%2030D",
        tags: ["perk", "fly"],
        rating: 4.6,
        inStock: true,
        features: ["Timed 30 days", "Server-wide", "Great for builders"],
        details: [
          { label: "Command", value: "/fly" },
          { label: "Duration", value: "30 days" },
        ],
        delivery: "Granted instantly after purchase. Relog if not visible.",
        whatsIncluded: ["Fly permission (time-limited)"],
      },
      {
        id: "perk-nick",
        slug: "nick-perk",
        name: "Nick Perk",
        description: "Change your display name with /nick.",
        price: 599,
        image: "/placeholder.svg?height=480&width=720&text=Nick",
        tags: ["perk", "nickname"],
        rating: 4.4,
        inStock: true,
        features: ["Change display name", "Moderation-safe filters"],
        details: [
          { label: "Command", value: "/nick" },
          { label: "Limits", value: "Subject to community guidelines" },
        ],
        delivery: "Instant.",
        disclaimer: "Inappropriate nicknames may be reverted by moderation.",
      },
    ],
  },
  {
    id: "c-bundles",
    slug: "bundles",
    title: "Bundles",
    description: "Get more for less with curated value packs.",
    image: "/placeholder.svg?height=560&width=1200&text=Bundles",
    products: [
      {
        id: "bundle-starter",
        slug: "starter-bundle",
        name: "Starter Bundle",
        description: "Rank + Keys combo to kickstart your journey.",
        price: 1999,
        image: "/placeholder.svg?height=480&width=720&text=Starter%20Bundle",
        tags: ["bundle", "value"],
        rating: 4.8,
        inStock: true,
        discountPercent: 15,
        features: ["Best value", "Instant delivery"],
        details: [{ label: "Includes", value: "VIP rank + 3x Rare Keys" }],
        whatsIncluded: ["VIP rank", "3x Rare Keys"],
        delivery: "Items are applied instantly post-purchase.",
      },
      {
        id: "bundle-cosmetic",
        slug: "cosmetic-bundle",
        name: "Cosmetics Bundle",
        description: "Hats, effects, and a pet—style up for less.",
        price: 1499,
        image: "/placeholder.svg?height=480&width=720&text=Cosmetic%20Bundle",
        tags: ["bundle", "cosmetic"],
        rating: 4.7,
        inStock: true,
        features: ["Cosmetic-focused", "Bundle savings"],
        details: [{ label: "Includes", value: "Hat + Effect + Pet" }],
        whatsIncluded: ["1x Hat", "1x Effect", "1x Pet"],
        delivery: "Applied instantly to your account.",
      },
    ],
  },
  {
    id: "c-pets",
    slug: "pets",
    title: "Pets",
    description:
      "Adopt friendly companions to follow you around on your adventures.",
    image: "/placeholder.svg?height=560&width=1200&text=Pets",
    products: [
      {
        id: "pet-wolf-2",
        slug: "wolf",
        name: "Wolf",
        description: "Loyal wolf companion. Cosmetic only.",
        price: 299,
        image: "/placeholder.svg?height=480&width=720&text=Wolf",
        tags: ["cosmetic", "pet"],
        rating: 4.8,
        inStock: true,
        features: ["Cosmetic only", "Follows you around", "Toggle anytime"],
        details: [
          { label: "Behavior", value: "Friendly companion" },
          { label: "Summon", value: "/pet" },
        ],
        whatsIncluded: ["Wolf cosmetic pet"],
      },
      {
        id: "pet-cat",
        slug: "cat",
        name: "Cat",
        description: "Cute cat that follows you around.",
        price: 349,
        image: "/placeholder.svg?height=480&width=720&text=Cat",
        tags: ["cosmetic", "pet"],
        rating: 4.9,
        inStock: true,
        features: ["Cosmetic only", "Follows you around", "Toggle anytime"],
        details: [
          { label: "Behavior", value: "Friendly companion" },
          { label: "Summon", value: "/pet" },
        ],
        whatsIncluded: ["Cat cosmetic pet"],
      },
    ],
  },
  {
    id: "c-titles",
    slug: "titles",
    title: "Titles",
    description: "Collect unique chat titles and tags to express yourself.",
    image: "/placeholder.svg?height=560&width=1200&text=Titles",
    products: [
      {
        id: "title-champion",
        slug: "champion-title",
        name: "Champion Title",
        description: "Show your prowess with the Champion tag.",
        price: 199,
        image: "/placeholder.svg?height=480&width=720&text=Champion",
        tags: ["title", "chat"],
        rating: 4.6,
        inStock: true,
        features: ["Chat flair", "Instant apply"],
        details: [{ label: "Type", value: "Chat title" }],
        delivery: "Granted instantly.",
      },
      {
        id: "title-royal",
        slug: "royal-title",
        name: "Royal Title",
        description: "A regal tag for prestigious players.",
        price: 249,
        image: "/placeholder.svg?height=480&width=720&text=Royal",
        tags: ["title", "chat"],
        rating: 4.7,
        inStock: true,
        features: ["Chat flair", "Instant apply"],
        details: [{ label: "Type", value: "Chat title" }],
        delivery: "Granted instantly.",
      },
    ],
  },
  {
    id: "c-misc",
    slug: "misc",
    title: "Miscellaneous",
    description: "Fun extras, gadgets, and surprises.",
    image: "/placeholder.svg?height=560&width=1200&text=Misc",
    products: [
      {
        id: "misc-firework",
        slug: "celebration-firework",
        name: "Celebration Firework",
        description: "Launch a dazzling firework display.",
        price: 149,
        image: "/placeholder.svg?height=480&width=720&text=Firework",
        tags: ["misc", "fun"],
        rating: 4.3,
        inStock: true,
        features: ["Visual celebration", "Party-ready"],
        details: [{ label: "Type", value: "Cosmetic consumable" }],
        delivery: "Granted instantly.",
      },
    ],
  },
];

/* =========================
     Optional: Navigation (if needed elsewhere)
     ========================= */

export const links = [
  { to: "/categories", label: "Categories", icon: Store },
  { to: "/support", label: "Support", icon: LifeBuoy },
];

/*  =========================
      Support: Data for support pages
      =========================*/
// Support data
export const supportData = {
  hero: {
    badge: { text: "Help Center", icon: LifeBuoy },
    title: "Support",
    subtitle: "We’re here to help",
    description:
      "Find answers to common questions, check payment options, and reach our team. Most purchases are delivered instantly.",
    buttons: {
      primary: "Open a Ticket",
      secondary: "Join Discord",
      primaryHref: "/support#contact",
      secondaryHref: "https://discord.gg/your-server",
    },
    helperLinks: [
      { label: "Refund policy", href: "/legal/refund-policy" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms of service", href: "/legal/terms" },
    ],
  },
  status: {
    state: "outage", // "operational" | "degraded" | "outage" | "maintenance"
    message: "",
    lastUpdatedISO: "2025-08-04T15:00:00.000Z",
  },
  howItWorks: [
    {
      title: "Choose your items",
      description:
        "Browse categories like Ranks, Crate Keys, and Cosmetics. Each product shows details and delivery rules.",
    },
    {
      title: "Checkout securely",
      description:
        "We use trusted payment processors. Your purchase is linked to your Minecraft username.",
    },
    {
      title: "Instant delivery",
      description:
        "Most items are delivered instantly by our server. If not, they arrive typically within a few minutes.",
    },
    {
      title: "Need help?",
      description:
        "Open a ticket or join our Discord. Provide your order ID and username for faster assistance.",
    },
  ],
  paymentMethods: [
    { name: "Credit/Debit Cards", detail: "Processed securely via provider." },
    { name: "PayPal", detail: "Use your PayPal balance or linked cards." },
    {
      name: "Gift Cards (if enabled)",
      detail: "When available during checkout.",
    },
    { name: "Regional methods", detail: "Shown automatically if supported." },
  ],
  refunds: {
    summary:
      "Digital goods are typically non-refundable once delivered. However, we do consider refunds in specific cases such as duplicate purchases, failed delivery, or unauthorized transactions. Please review our full policy.",
    ctaLabel: "Read full policy",
    ctaHref: "/legal/refund-policy",
  },
  faqs: [
    {
      q: "How fast is delivery?",
      a: "Instant for most items. If it doesn’t arrive within 10 minutes, relog into the server. Still missing? Open a ticket with your order ID.",
    },
    {
      q: "Do ranks stack or replace?",
      a: "Higher ranks replace lower ones while keeping applicable perks. See rank descriptions for details.",
    },
    {
      q: "What if I typed the wrong username?",
      a: "Contact support immediately. If the item was not redeemed, we’ll try to correct it. We can’t guarantee fixes after delivery.",
    },
    {
      q: "Are purchases pay-to-win?",
      a: "We balance perks to keep gameplay fair. Cosmetic items don’t give competitive advantages.",
    },
    {
      q: "Which payment methods are supported?",
      a: "We support major cards, PayPal, and selected regional options depending on your location.",
    },
    {
      q: "How do I request a refund?",
      a: "Review the Refund Policy and open a ticket. Include order ID, date, and reason. We’ll investigate promptly.",
    },
  ],
  contact: {
    ticket: {
      title: "Open a Support Ticket",
      description:
        "Provide your order ID, Minecraft username, and a clear description of the issue.",
      successMessage: "Ticket submitted! Our team will reply via email.",
      errorMessage: "Unable to submit right now. Please try again later.",
    },
    channels: [
      {
        label: "Discord",
        href: "https://discord.gg/your-server",
        note: "Fastest community help",
      },
      {
        label: "Email",
        href: "mailto:support@blockshop.example.com",
        note: "Official support channel",
      },
    ],
  },
};
