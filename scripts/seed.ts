import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // カテゴリを作成
  const imageCategory = await prisma.category.upsert({
    where: { slug: "image" },
    update: {},
    create: {
      name: "画像",
      slug: "image",
      description: "画像データセット",
      order: 1,
    },
  })

  const textCategory = await prisma.category.upsert({
    where: { slug: "text" },
    update: {},
    create: {
      name: "テキスト",
      slug: "text",
      description: "テキストデータセット",
      order: 2,
    },
  })

  const audioCategory = await prisma.category.upsert({
    where: { slug: "audio" },
    update: {},
    create: {
      name: "音声",
      slug: "audio",
      description: "音声データセット",
      order: 3,
    },
  })

  console.log("✅ Categories created")

  // プラットフォーム設定を作成（既に存在する場合はスキップ）
  const existingSettings = await prisma.platformSettings.findFirst()
  if (!existingSettings) {
    await prisma.platformSettings.create({
      data: {
        platformFeeRate: 15.0,
        paymentFeeBearer: "SELLER",
        allowFreeDatasets: true,
      },
    })
  }

  console.log("✅ Platform settings created")
  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

