import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminNumber = process.env.ADMIN_TOPUP_NUMBER ?? "087760337535";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function randomInvoice(prefix: string, index: number) {
  const date = "20260601";
  return `${prefix}-${date}-${String(index).padStart(4, "0")}`;
}

const games = [
  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    description:
      "Akun Mobile Legends siap main dengan filter rank, jumlah skin, hero, bind akun, dan status original owner.",
    banner: "/visuals/game-mobile-legends.png",
    icon: "ML",
    filters: [
      ["Rank", "rank", ["Epic", "Legend", "Mythic", "Mythical Honor", "Mythical Glory"]],
      ["Skin", "skin", ["Epic", "Collector", "Legend", "Limited"]],
      ["Hero", "hero", ["80+", "100+", "120+"]],
      ["Bind akun", "bind", ["Moonton", "Google", "Facebook", "VK"]],
      ["Original owner", "owner", ["Original owner", "Bukan original owner"]],
    ],
  },
  {
    name: "Free Fire",
    slug: "free-fire",
    description:
      "Kategori Free Fire untuk akun sultan, bundle langka, skin gun premium, dan rank aktif.",
    banner: "/visuals/game-free-fire.png",
    icon: "FF",
    filters: [
      ["Level", "level", ["50+", "60+", "70+"]],
      ["Bundle", "bundle", ["Banyak", "Rare", "Sultan"]],
      ["Skin gun", "skin_gun", ["Evo", "Legendary", "Premium"]],
      ["Rank", "rank", ["Diamond", "Heroic", "Master"]],
      ["Bind akun", "bind", ["Facebook", "Google", "VK"]],
    ],
  },
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    description:
      "Cari akun PUBG Mobile dengan outfit, skin senjata, rank, dan region yang jelas sebelum transaksi.",
    banner: "/visuals/game-pubg-mobile.png",
    icon: "PUBG",
    filters: [
      ["Rank", "rank", ["Crown", "Ace", "Conqueror"]],
      ["Region", "region", ["Asia", "KRJP", "Global"]],
      ["Skin senjata", "weapon_skin", ["M416", "AKM", "AWM"]],
    ],
  },
  {
    name: "Valorant",
    slug: "valorant",
    description:
      "Akun Valorant region jelas, rank kompetitif, skin weapon, agent terbuka, dan email access.",
    banner: "/visuals/game-valorant.png",
    icon: "VAL",
    filters: [
      ["Rank", "rank", ["Gold", "Platinum", "Diamond", "Ascendant"]],
      ["Region", "region", ["APAC", "NA", "EU"]],
      ["Skin weapon", "weapon_skin", ["Vandal", "Phantom", "Knife"]],
      ["Agent", "agent", ["15+", "20+", "Full"]],
      ["Email access", "email_access", ["Full access", "Changeable"]],
    ],
  },
  {
    name: "Roblox",
    slug: "roblox",
    description:
      "Akun Roblox dengan item, Robux history, avatar, dan akses email yang bisa dicek buyer.",
    banner: "/visuals/game-roblox.png",
    icon: "RBX",
    filters: [
      ["Item", "item", ["Limited", "Avatar", "Gamepass"]],
      ["Email", "email", ["Ready", "Changeable"]],
      ["Umur akun", "age", ["1 tahun+", "3 tahun+", "5 tahun+"]],
    ],
  },
  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    description:
      "Akun Genshin Impact dengan AR, karakter bintang lima, weapon, server, dan bind akun transparan.",
    banner: "/visuals/game-genshin-impact.png",
    icon: "GI",
    filters: [
      ["Adventure Rank", "ar", ["AR45+", "AR55+", "AR60"]],
      ["Karakter", "character", ["5 star", "Archon", "Limited"]],
      ["Server", "server", ["Asia", "America", "Europe"]],
    ],
  },
  {
    name: "Clash of Clans",
    slug: "clash-of-clans",
    description:
      "Akun Clash of Clans dengan TH, level hero, base rapi, dan status Supercell ID yang aman.",
    banner: "/visuals/game-clash-of-clans.png",
    icon: "COC",
    filters: [
      ["Town Hall", "th", ["TH12", "TH13", "TH14", "TH15"]],
      ["Hero", "hero", ["Tinggi", "Max TH", "Rata kanan"]],
      ["Supercell ID", "bind", ["Full access", "Changeable"]],
    ],
  },
  {
    name: "Steam Games",
    slug: "steam",
    description:
      "Akun Steam berisi koleksi game, inventory, status email, dan riwayat VAC yang wajib jelas.",
    banner: "/visuals/game-steam.png",
    icon: "STM",
    filters: [
      ["Game library", "library", ["10+", "50+", "100+"]],
      ["Inventory", "inventory", ["Ada", "Premium", "Rare"]],
      ["Email access", "email_access", ["Full access", "Changeable"]],
    ],
  },
  {
    name: "Point Blank",
    slug: "point-blank",
    description:
      "Akun Point Blank dengan pangkat, weapon, item permanen, dan data bind yang bisa diverifikasi.",
    banner: "/visuals/game-point-blank.png",
    icon: "PB",
    filters: [
      ["Pangkat", "rank", ["Major", "Colonel", "Brigadier"]],
      ["Weapon", "weapon", ["Permanent", "Rare", "Premium"]],
      ["Bind", "bind", ["Email ready", "Full access"]],
    ],
  },
  {
    name: "Call of Duty Mobile",
    slug: "call-of-duty-mobile",
    description:
      "Akun COD Mobile dengan skin, rank, CP history, region, dan akses login yang lengkap.",
    banner: "/visuals/game-call-of-duty-mobile.png",
    icon: "CODM",
    filters: [
      ["Rank", "rank", ["Master", "Grandmaster", "Legendary"]],
      ["Skin", "skin", ["Epic", "Legendary", "Mythic"]],
      ["Region", "region", ["Asia", "Global"]],
    ],
  },
];

const productTemplates = [
  ["Mobile Legends", "Akun ML Mythic 45 Stars, Skin Epic Banyak, Siap Main", 425000, "Mythic 45 Stars", "82", "Indonesia", "Android/iOS"],
  ["Mobile Legends", "Akun ML Mythical Glory 78 Stars, Collector Rapi", 1150000, "Mythical Glory", "96", "Indonesia", "Android/iOS"],
  ["Free Fire", "Akun FF Sultan Bundle Banyak, Level Tinggi", 680000, "Heroic", "72", "Indonesia", "Android"],
  ["Free Fire", "Akun FF Evo Gun 4 Slot, Bundle Rare, Email Aman", 925000, "Master", "76", "Indonesia", "Android/iOS"],
  ["PUBG Mobile", "Akun PUBG Ace Master, M416 Glacier, Outfit Premium", 790000, "Ace Master", "69", "Asia", "Android/iOS"],
  ["Valorant", "Akun Valorant Platinum Region APAC, Skin Vandal Premium", 540000, "Platinum", "48", "APAC", "PC"],
  ["Valorant", "Akun Valorant Diamond, Phantom Oni, Email Full Access", 875000, "Diamond", "63", "APAC", "PC"],
  ["Roblox", "Akun Roblox Item Banyak, Email Ready", 310000, "Verified", "2019 Account", "Global", "PC/Mobile"],
  ["Genshin Impact", "Akun Genshin AR57, Banyak Bintang 5, Server Asia", 1350000, "AR57", "57", "Asia", "PC/Mobile"],
  ["Clash of Clans", "Akun COC TH13 Rapi, Hero Tinggi", 620000, "TH13", "183", "Global", "Android/iOS"],
  ["Steam Games", "Akun Steam Library 80+ Game, Email Full Access", 990000, "Level 24", "24", "Global", "PC"],
  ["Point Blank", "Akun PB Colonel Weapon Permanent Banyak", 455000, "Colonel", "81", "Indonesia", "PC"],
  ["Call of Duty Mobile", "Akun CODM Legendary, Skin Mythic Aktif", 830000, "Legendary", "150", "Asia", "Android/iOS"],
];

async function main() {
  const adminUsername = process.env.ADMIN_DEFAULT_USERNAME ?? "alfarez@gmail.com";
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? "alfarez@gmail.com";
  const adminPassword = process.env.ADMIN_DEFAULT_TEMP_PASSWORD ?? "ezel301123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const legacyAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { username: "alfarez.com" },
        { email: "admin@alfarez.com" },
        { username: adminUsername },
        { email: adminEmail },
      ],
    },
  });

  const admin = legacyAdmin
    ? await prisma.user.update({
        where: { id: legacyAdmin.id },
        data: {
          username: adminUsername,
          email: adminEmail,
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          mustChangePassword: true,
          status: "ACTIVE",
          avatar: "/avatars/admin.png",
          phone: adminNumber,
          wallet: { upsert: { update: {}, create: {} } },
          adminProfile: {
            upsert: {
              update: { displayName: "Admin Alfarezel", department: "Trust & Safety" },
              create: { displayName: "Admin Alfarezel", department: "Trust & Safety" },
            },
          },
        },
      })
    : await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      mustChangePassword: true,
      avatar: "/avatars/admin.png",
      phone: adminNumber,
      wallet: { create: {} },
      adminProfile: {
        create: {
          displayName: "Admin Alfarezel",
          department: "Trust & Safety",
        },
      },
      },
    });

  await prisma.platformSetting.upsert({
    where: { key: "site_name" },
    update: { value: "Alfarezel Market" },
    create: { key: "site_name", value: "Alfarezel Market" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "admin_topup_number" },
    update: { value: adminNumber },
    create: { key: "admin_topup_number", value: adminNumber },
  });

  await prisma.feeSetting.upsert({
    where: { kind: "TOPUP" },
    update: { percentage: 2, fixedFee: 1000, minAmount: 10000, maxAmount: 5000000 },
    create: { kind: "TOPUP", percentage: 2, fixedFee: 1000, minAmount: 10000, maxAmount: 5000000 },
  });
  await prisma.feeSetting.upsert({
    where: { kind: "WITHDRAW" },
    update: { percentage: 1, fixedFee: 1500, minAmount: 25000, maxAmount: 10000000 },
    create: { kind: "WITHDRAW", percentage: 1, fixedFee: 1500, minAmount: 25000, maxAmount: 10000000 },
  });
  await prisma.feeSetting.upsert({
    where: { kind: "PLATFORM" },
    update: { percentage: 3, fixedFee: 0, minAmount: 0 },
    create: { kind: "PLATFORM", percentage: 3, fixedFee: 0, minAmount: 0 },
  });

  const gameByName = new Map<string, string>();
  for (const game of games) {
    const created = await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        description: game.description,
        banner: game.banner,
        icon: game.icon,
        isFeatured: true,
      },
      create: {
        name: game.name,
        slug: game.slug,
        description: game.description,
        banner: game.banner,
        icon: game.icon,
        isFeatured: true,
      },
    });
    gameByName.set(game.name, created.id);

    for (const [name, key, options] of game.filters) {
      const filterName = name as string;
      const filterKey = key as string;
      const filterOptions = options as string[];
      const existing = await prisma.gameFilter.findFirst({ where: { gameId: created.id, key: filterKey } });
      if (!existing) {
        await prisma.gameFilter.create({
          data: { gameId: created.id, name: filterName, key: filterKey, options: filterOptions },
        });
      }
    }
  }

  const sellerPassword = await bcrypt.hash("seller12345", 12);
  const sellers = await Promise.all(
    [
      ["rezastore", "Reza Store ID", "Menjual akun original owner, data lengkap, dan siap bantu buyer sampai akun aman dipakai."],
      ["leveluphub", "LevelUp Hub", "Fokus akun rank tinggi dan inventory premium. Semua produk dicek sebelum tayang."],
      ["akunrapi", "Akun Rapi Nusantara", "Seller terverifikasi untuk akun game populer dengan riwayat transaksi bersih."],
    ].map(async ([username, storeName, description], index) => {
      return prisma.user.upsert({
        where: { username },
        update: { role: UserRole.SELLER, status: "ACTIVE" },
        create: {
          username,
          email: `${username}@alfarez.com`,
          passwordHash: sellerPassword,
          role: UserRole.SELLER,
          status: "ACTIVE",
          avatar: `/avatars/seller-${index + 1}.png`,
          phone: `08776033753${index}`,
          wallet: { create: { balanceAvailable: 850000 + index * 120000, balanceHold: 250000 } },
          sellerProfile: {
            create: {
              storeName,
              slug: slugify(storeName),
              whatsapp: `08776033753${index}`,
              description,
              gamesSold: ["Mobile Legends", "Free Fire", "Valorant", "Steam Games"],
              experience: "Sudah terbiasa transaksi akun game dengan bukti lengkap dan aftersales jelas.",
              reason: "Ingin jualan lewat sistem escrow supaya buyer dan seller sama-sama aman.",
              status: "APPROVED",
              isVerified: index !== 1,
              rating: index === 1 ? 4.7 : 4.9,
              successfulSales: 82 + index * 23,
            },
          },
        },
        include: { sellerProfile: true },
      });
    }),
  );

  const buyerPassword = await bcrypt.hash("buyer12345", 12);
  const existingBuyer = await prisma.user.findFirst({
    where: { OR: [{ username: "reza.buyer" }, { email: "buyer@alfarez.com" }] },
  });
  const buyer = existingBuyer ? await prisma.user.update({
    where: { id: existingBuyer.id },
    data: {
      username: "reza.buyer",
      email: "buyer@alfarez.com",
      passwordHash: buyerPassword,
      role: UserRole.BUYER,
      status: "ACTIVE",
      avatar: "/avatars/buyer.png",
      wallet: { upsert: { update: { balanceAvailable: 1500000, balanceHold: 0 }, create: { balanceAvailable: 1500000, balanceHold: 0 } } },
      profile: { upsert: { update: { fullName: "Reza Buyer", bio: "Suka cari akun siap main yang aman lewat escrow." }, create: { fullName: "Reza Buyer", bio: "Suka cari akun siap main yang aman lewat escrow." } } },
    },
  }) : await prisma.user.create({
    data: {
      username: "reza.buyer",
      email: "buyer@alfarez.com",
      passwordHash: buyerPassword,
      role: UserRole.BUYER,
      status: "ACTIVE",
      avatar: "/avatars/buyer.png",
      wallet: { create: { balanceAvailable: 1500000, balanceHold: 0 } },
      profile: { create: { fullName: "Reza Buyer", bio: "Suka cari akun siap main yang aman lewat escrow." } },
    },
  });

  let productIndex = 0;
  for (const template of productTemplates) {
    const [gameName, title, price, rank, level, server, platform] = template;
    const gameId = gameByName.get(gameName as string);
    if (!gameId) continue;
    const seller = sellers[productIndex % sellers.length];
    const slug = slugify(title as string);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        price: price as number,
        status: productIndex === 3 ? "SOLD" : "READY",
        isFeatured: productIndex < 6,
        isVerified: true,
      },
      create: {
        sellerId: seller.id,
        gameId,
        title: title as string,
        slug,
        price: price as number,
        status: productIndex === 3 ? "SOLD" : "READY",
        rank: rank as string,
        level: level as string,
        server: server as string,
        platform: platform as string,
        bindInfo: "Email aktif, data recovery disiapkan seller, transaksi wajib lewat sistem.",
        description:
          "Akun sudah dicek sebelum listing. Detail login akan dikirim lewat chat transaksi setelah pembayaran masuk escrow. Pastikan data akun sudah sesuai sebelum transaksi selesai.",
        securityNote:
          "Demi keamanan, lakukan transaksi hanya melalui saldo Alfarezel Market. Jangan transfer langsung ke seller.",
        isFeatured: productIndex < 6,
        isVerified: true,
        soldCount: 4 + productIndex * 2,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productAttribute.deleteMany({ where: { productId: product.id } });

    await prisma.productImage.createMany({
      data: [0, 1, 2].map((offset) => ({
        productId: product.id,
        url: `/visuals/product-${(productIndex % 8) + 1}-${offset + 1}.png`,
        alt: `${title} screenshot ${offset + 1}`,
        sortOrder: offset,
      })),
    });

    await prisma.productAttribute.createMany({
      data: [
        { productId: product.id, key: "Original owner", value: productIndex % 2 === 0 ? "Ya" : "Tidak, tapi data lengkap" },
        { productId: product.id, key: "Garansi cek", value: "1x24 jam setelah data dikirim" },
        { productId: product.id, key: "Status bind", value: "Bisa dibantu pindah bind" },
      ],
    });

    productIndex += 1;
  }

  const topup = await prisma.topupRequest.upsert({
    where: { invoiceId: randomInvoice("TOPUP", 1) },
    update: {},
    create: {
      invoiceId: randomInvoice("TOPUP", 1),
      userId: buyer.id,
      amount: 50000,
      fee: 1000,
      totalTransfer: 51000,
      paymentMethod: "DANA",
      adminNumber,
      proofImage: "/proofs/topup-initial.png",
      status: "WAITING_ADMIN_CONFIRMATION",
      userNote: "Sudah transfer sesuai total pembayaran.",
    },
  });

  const primaryOrderProduct = await prisma.product.findUnique({
    where: { slug: "akun-valorant-platinum-region-apac-skin-vandal-premium" },
  });

  if (primaryOrderProduct) {
    const order = await prisma.order.upsert({
      where: { invoiceId: randomInvoice("ORDER", 1) },
      update: {
        buyerId: buyer.id,
        sellerId: primaryOrderProduct.sellerId,
        productId: primaryOrderProduct.id,
        status: "ACCOUNT_SENT",
        escrowStatus: "HELD",
      },
      create: {
        invoiceId: randomInvoice("ORDER", 1),
        buyerId: buyer.id,
        sellerId: primaryOrderProduct.sellerId,
        productId: primaryOrderProduct.id,
        productPrice: primaryOrderProduct.price,
        platformFee: Math.ceil(primaryOrderProduct.price * 0.03),
        totalPaid: primaryOrderProduct.price + Math.ceil(primaryOrderProduct.price * 0.03),
        status: "ACCOUNT_SENT",
        escrowStatus: "HELD",
        sellerSubmittedAt: new Date(),
      },
    });

    const chat = await prisma.orderChat.upsert({
      where: { orderId: order.id },
      update: { isLocked: false },
      create: { orderId: order.id },
    });

    await prisma.chatMessage.deleteMany({ where: { chatId: chat.id } });
    await prisma.chatMessage.createMany({
      data: [
        { chatId: chat.id, type: "SYSTEM", body: "Order dibuat." },
        { chatId: chat.id, type: "SYSTEM", body: "Pembayaran berhasil." },
        { chatId: chat.id, senderId: primaryOrderProduct.sellerId, type: "USER", body: "Halo kak, aku proses dulu ya. Data akun akan dikirim lewat sistem aman." },
        { chatId: chat.id, type: "SYSTEM", body: "Seller sedang memproses pesanan." },
        { chatId: chat.id, senderId: primaryOrderProduct.sellerId, type: "SECURE_ACCOUNT_DATA", body: "Data akun telah dikirim lewat penyimpanan aman." },
        { chatId: chat.id, senderId: buyer.id, type: "USER", body: "Sudah masuk. Aku cek beberapa data dulu sebelum konfirmasi selesai." },
      ],
    });

    const existingOrderLog = await prisma.walletTransaction.findFirst({
      where: { userId: buyer.id, referenceId: order.invoiceId, type: "PURCHASE" },
    });
    if (!existingOrderLog) {
      await prisma.walletTransaction.create({
        data: {
          userId: buyer.id,
          type: "PURCHASE",
          amount: -order.totalPaid,
          fee: order.platformFee,
          balanceBefore: 2056200,
          balanceAfter: 1500000,
          status: "SUCCESS",
          referenceId: order.invoiceId,
          description: "Pembelian awal. Dana masuk escrow sampai transaksi aman.",
        },
      });
    }
  }

  await prisma.adminLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_INITIAL_DATA",
      entity: "system",
      metadata: { topupInvoice: topup.invoiceId, note: "Initial data generated" },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
