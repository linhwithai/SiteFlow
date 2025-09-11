/**
 * Script to seed demo projects data
 * Run with: npm run db:seed
 */

import { db } from '../src/libs/DB';
import { projectSchema } from '../src/models/Schema';
import { PROJECT_STATUS } from '../src/types/Enum';

const demoProjects = [
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Chung cư Green Tower',
    description: 'Xây dựng tòa nhà chung cư cao cấp 25 tầng với 300 căn hộ, bao gồm hầm để xe, khu vui chơi và tiện ích đầy đủ.',
    address: '123 Đường Lê Văn Việt, Quận 7',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-12-31'),
    budget: 500000000000, // 500 tỷ VNĐ
    status: PROJECT_STATUS.ACTIVE,
    projectManagerId: 'user_demo_1',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Trường học Quốc tế ABC',
    description: 'Xây dựng trường học quốc tế với diện tích 10,000m2, bao gồm 50 phòng học, thư viện, phòng thí nghiệm và sân thể thao.',
    address: '456 Đường Nguyễn Văn Cừ, Quận 5',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-06-30'),
    budget: 200000000000, // 200 tỷ VNĐ
    status: PROJECT_STATUS.ACTIVE,
    projectManagerId: 'user_demo_2',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Bệnh viện Đa khoa XYZ',
    description: 'Xây dựng bệnh viện đa khoa 500 giường bệnh với đầy đủ trang thiết bị y tế hiện đại.',
    address: '789 Đường Cách Mạng Tháng 8, Quận 10',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-12-31'),
    budget: 800000000000, // 800 tỷ VNĐ
    status: PROJECT_STATUS.COMPLETED,
    projectManagerId: 'user_demo_1',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Trung tâm Thương mại DEF',
    description: 'Xây dựng trung tâm thương mại 7 tầng với 200 cửa hàng, rạp chiếu phim và khu ẩm thực.',
    address: '321 Đường Võ Văn Tần, Quận 3',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-08-31'),
    budget: 600000000000, // 600 tỷ VNĐ
    status: PROJECT_STATUS.ON_HOLD,
    projectManagerId: 'user_demo_3',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Nhà máy Sản xuất GHI',
    description: 'Xây dựng nhà máy sản xuất điện tử với diện tích 15,000m2 và công suất 10,000 sản phẩm/ngày.',
    address: '654 Đường Tân Hương, Quận Tân Phú',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-03-31'),
    budget: 300000000000, // 300 tỷ VNĐ
    status: PROJECT_STATUS.CANCELLED,
    projectManagerId: 'user_demo_2',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Khu dân cư JKL',
    description: 'Xây dựng khu dân cư với 100 căn nhà liền kề, mỗi căn 100m2, bao gồm hạ tầng giao thông và tiện ích.',
    address: '987 Đường Lê Đức Thọ, Quận Gò Vấp',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2025-11-30'),
    budget: 150000000000, // 150 tỷ VNĐ
    status: PROJECT_STATUS.PLANNING,
    projectManagerId: 'user_demo_1',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Cầu vượt MNO',
    description: 'Xây dựng cầu vượt dài 2km nối liền Quận 1 và Quận 2, giảm thiểu ùn tắc giao thông.',
    address: 'Đường Điện Biên Phủ, Quận 1',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-06-30'),
    budget: 400000000000, // 400 tỷ VNĐ
    status: PROJECT_STATUS.ACTIVE,
    projectManagerId: 'user_demo_3',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Sân bay Quốc tế PQR',
    description: 'Mở rộng sân bay quốc tế với nhà ga mới, tăng công suất phục vụ lên 50 triệu khách/năm.',
    address: 'Sân bay Tân Sơn Nhất, Quận Tân Bình',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2026-12-31'),
    budget: 1200000000000, // 1.2 nghìn tỷ VNĐ
    status: PROJECT_STATUS.ACTIVE,
    projectManagerId: 'user_demo_1',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Metro Line 3',
    description: 'Xây dựng tuyến metro số 3 dài 20km từ Bến Thành đến Tân Kiên, bao gồm 15 ga tàu điện ngầm.',
    address: 'Tuyến đường từ Bến Thành đến Tân Kiên',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2027-12-31'),
    budget: 2000000000000, // 2 nghìn tỷ VNĐ
    status: PROJECT_STATUS.PLANNING,
    projectManagerId: 'user_demo_2',
    isActive: true,
  },
  {
    organizationId: 'org_demo_1',
    name: 'Dự án Khu công nghiệp STU',
    description: 'Xây dựng khu công nghiệp với diện tích 500ha, thu hút các doanh nghiệp công nghệ cao.',
    address: 'Khu công nghiệp Củ Chi, Huyện Củ Chi',
    city: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2024-09-30'),
    budget: 1000000000000, // 1 nghìn tỷ VNĐ
    status: PROJECT_STATUS.COMPLETED,
    projectManagerId: 'user_demo_3',
    isActive: true,
  },
];

async function seedProjects() {
  try {
    console.log('🌱 Starting to seed projects...');
    
    // Clear existing projects (optional - remove if you want to keep existing data)
    // await db.delete(projectSchema);
    
    // Insert demo projects
    const insertedProjects = await db
      .insert(projectSchema)
      .values(demoProjects)
      .returning();
    
    console.log(`✅ Successfully seeded ${insertedProjects.length} projects!`);
    
    // Display summary
    const statusCounts = demoProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Project Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} projects`);
    });
    
    const totalBudget = demoProjects.reduce((sum, project) => sum + project.budget, 0);
    console.log(`\n💰 Total Budget: ${new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(totalBudget)}`);
    
    console.log('\n🎉 Demo data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProjects()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
