import { PrismaClient, MetricType } from '@prisma/client';

const prisma = new PrismaClient();

// デフォルトカテゴリと項目の定義
const defaultCategories = [
  {
    name: '保険診療',
    color: '#3b82f6', // blue
    icon: 'Shield',
    items: [
      { name: '患者数', type: MetricType.COUNT, unit: '人' },
      { name: '新患数', type: MetricType.COUNT, unit: '人' },
      { name: '再初診数', type: MetricType.COUNT, unit: '人' },
      { name: 'キャンセル数', type: MetricType.COUNT, unit: '件' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
  {
    name: '自費診療（矯正）',
    color: '#8b5cf6', // purple
    icon: 'Smile',
    items: [
      { name: '患者数', type: MetricType.COUNT, unit: '人' },
      { name: '新患数', type: MetricType.COUNT, unit: '人' },
      { name: '相談件数', type: MetricType.COUNT, unit: '件' },
      { name: '契約件数', type: MetricType.COUNT, unit: '件' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
  {
    name: '自費診療（インプラント）',
    color: '#f59e0b', // amber
    icon: 'CircleDot',
    items: [
      { name: '患者数', type: MetricType.COUNT, unit: '人' },
      { name: '新患数', type: MetricType.COUNT, unit: '人' },
      { name: '相談件数', type: MetricType.COUNT, unit: '件' },
      { name: '手術件数', type: MetricType.COUNT, unit: '件' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
  {
    name: '自費診療（審美）',
    color: '#ec4899', // pink
    icon: 'Sparkles',
    items: [
      { name: '患者数', type: MetricType.COUNT, unit: '人' },
      { name: 'ホワイトニング件数', type: MetricType.COUNT, unit: '件' },
      { name: 'セラミック件数', type: MetricType.COUNT, unit: '件' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
  {
    name: '予防・メンテナンス',
    color: '#10b981', // emerald
    icon: 'HeartPulse',
    items: [
      { name: '患者数', type: MetricType.COUNT, unit: '人' },
      { name: '新患数', type: MetricType.COUNT, unit: '人' },
      { name: 'リコール来院数', type: MetricType.COUNT, unit: '人' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
  {
    name: '物販',
    color: '#f97316', // orange
    icon: 'ShoppingBag',
    items: [
      { name: '販売件数', type: MetricType.COUNT, unit: '件' },
      { name: '売上', type: MetricType.CURRENCY, unit: '円' },
    ],
  },
];

// クリニックにデフォルトカテゴリと項目を作成する関数
export async function createDefaultMetricCategories(clinicId: string) {
  for (let i = 0; i < defaultCategories.length; i++) {
    const categoryData = defaultCategories[i];

    // カテゴリを作成
    const category = await prisma.metricCategory.create({
      data: {
        clinicId,
        name: categoryData.name,
        color: categoryData.color,
        icon: categoryData.icon,
        sortOrder: i,
        isDefault: true,
        isActive: true,
      },
    });

    // 項目を作成
    for (let j = 0; j < categoryData.items.length; j++) {
      const itemData = categoryData.items[j];
      await prisma.metricItem.create({
        data: {
          clinicId,
          categoryId: category.id,
          name: itemData.name,
          type: itemData.type,
          unit: itemData.unit,
          sortOrder: j,
          isDefault: true,
          isActive: true,
        },
      });
    }
  }
}

// メイン関数（直接実行用）
async function main() {
  // 全てのクリニックを取得
  const clinics = await prisma.clinic.findMany({
    include: {
      metricCategories: true,
    },
  });

  for (const clinic of clinics) {
    // すでにカテゴリが存在する場合はスキップ
    if (clinic.metricCategories.length > 0) {
      console.log(`Skipping clinic ${clinic.name} - already has metric categories`);
      continue;
    }

    console.log(`Creating default metric categories for clinic: ${clinic.name}`);
    await createDefaultMetricCategories(clinic.id);
    console.log(`Done creating categories for clinic: ${clinic.name}`);
  }
}

// 直接実行された場合のみ main を呼び出す
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
