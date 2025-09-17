const createDemoData = async () => {
  try {
    console.log('🚀 Creating Demo Data...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    // Sample data for projects
    const projects = [
      {
        name: "Nhà A Toàn Hương Tích Lương",
        description: "Dự án xây dựng nhà ở dân cư tại Hương Tích Lương",
        address: "Số nhà A, Hương Tích Lương",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "planning",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        budget: 5000000000,
        projectManagerId: "pm-001"
      },
      {
        name: "Chung cư Green Tower",
        description: "Dự án chung cư cao cấp tại quận Cầu Giấy",
        address: "123 Đường Cầu Giấy, Quận Cầu Giấy",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-02-01",
        endDate: "2025-06-30",
        budget: 15000000000,
        projectManagerId: "pm-002"
      },
      {
        name: "Trường học Tiểu học Hoa Mai",
        description: "Xây dựng trường tiểu học mới tại huyện Đông Anh",
        address: "456 Đường Quốc lộ 3, Đông Anh",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "completed",
        startDate: "2023-06-01",
        endDate: "2024-05-31",
        budget: 8000000000,
        projectManagerId: "pm-003"
      },
      {
        name: "Bệnh viện Đa khoa Tân Mai",
        description: "Xây dựng bệnh viện đa khoa hiện đại",
        address: "789 Đường Tân Mai, Hoàng Mai",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-03-15",
        endDate: "2025-12-31",
        budget: 20000000000,
        projectManagerId: "pm-004"
      },
      {
        name: "Khu đô thị mới Vinhomes",
        description: "Dự án khu đô thị mới với đầy đủ tiện ích",
        address: "Khu đô thị Vinhomes, Nam Từ Liêm",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "planning",
        startDate: "2024-07-01",
        endDate: "2026-12-31",
        budget: 50000000000,
        projectManagerId: "pm-005"
      },
      {
        name: "Nhà máy sản xuất điện tử",
        description: "Xây dựng nhà máy sản xuất linh kiện điện tử",
        address: "Khu công nghiệp Bắc Thăng Long",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-01-15",
        endDate: "2024-11-30",
        budget: 12000000000,
        projectManagerId: "pm-006"
      },
      {
        name: "Trung tâm thương mại Vincom",
        description: "Xây dựng trung tâm thương mại hiện đại",
        address: "321 Đường Láng, Đống Đa",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "completed",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        budget: 18000000000,
        projectManagerId: "pm-007"
      },
      {
        name: "Khu nghỉ dưỡng cao cấp",
        description: "Dự án khu nghỉ dưỡng 5 sao tại Vịnh Hạ Long",
        address: "Vịnh Hạ Long, Quảng Ninh",
        city: "Hạ Long",
        province: "Quảng Ninh",
        status: "planning",
        startDate: "2024-09-01",
        endDate: "2026-08-31",
        budget: 30000000000,
        projectManagerId: "pm-008"
      },
      {
        name: "Cầu vượt Ngã tư Sở",
        description: "Xây dựng cầu vượt tại ngã tư Sở",
        address: "Ngã tư Sở, Đống Đa",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        budget: 6000000000,
        projectManagerId: "pm-009"
      },
      {
        name: "Trường Đại học Công nghệ",
        description: "Xây dựng cơ sở mới cho trường đại học",
        address: "Khu đô thị Đại học Quốc gia",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-02-15",
        endDate: "2025-08-31",
        budget: 25000000000,
        projectManagerId: "pm-010"
      },
      {
        name: "Nhà ga sân bay Nội Bài",
        description: "Mở rộng nhà ga T2 sân bay Nội Bài",
        address: "Sân bay Nội Bài, Sóc Sơn",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "planning",
        startDate: "2024-10-01",
        endDate: "2027-09-30",
        budget: 40000000000,
        projectManagerId: "pm-011"
      },
      {
        name: "Khu dân cư Eco City",
        description: "Dự án khu dân cư sinh thái thông minh",
        address: "Khu đô thị Eco City, Long Biên",
        city: "Hà Nội",
        province: "Hà Nội",
        status: "in_progress",
        startDate: "2024-05-01",
        endDate: "2026-04-30",
        budget: 35000000000,
        projectManagerId: "pm-012"
      }
    ];

    // Sample work items for each project
    const workItemTemplates = [
      { name: "Đào móng", description: "Đào móng và xử lý nền móng", category: "foundation", priority: "high" },
      { name: "Đổ bê tông móng", description: "Đổ bê tông móng và cột", category: "concrete", priority: "high" },
      { name: "Xây tường", description: "Xây tường gạch và bê tông", category: "masonry", priority: "medium" },
      { name: "Lắp đặt điện", description: "Lắp đặt hệ thống điện", category: "electrical", priority: "medium" },
      { name: "Lắp đặt nước", description: "Lắp đặt hệ thống cấp thoát nước", category: "plumbing", priority: "medium" },
      { name: "Lát nền", description: "Lát nền gạch và đá", category: "flooring", priority: "low" },
      { name: "Sơn tường", description: "Sơn tường và trang trí", category: "painting", priority: "low" },
      { name: "Lắp đặt cửa", description: "Lắp đặt cửa và cửa sổ", category: "doors_windows", priority: "medium" },
      { name: "Lắp đặt mái", description: "Lắp đặt mái tôn và thoát nước", category: "roofing", priority: "high" },
      { name: "Hoàn thiện", description: "Hoàn thiện và dọn dẹp", category: "finishing", priority: "low" },
      { name: "Kiểm tra chất lượng", description: "Kiểm tra và nghiệm thu", category: "inspection", priority: "high" },
      { name: "Bàn giao", description: "Bàn giao công trình", category: "handover", priority: "high" }
    ];

    // Sample daily log data
    const dailyLogTemplates = [
      {
        title: "Khởi công dự án",
        weather: "nắng",
        temperature: 28,
        workDescription: "Bắt đầu khởi công dự án, chuẩn bị mặt bằng",
        workHours: 8,
        workersCount: 15,
        issues: "Không có vấn đề gì",
        notes: "Thời tiết thuận lợi cho việc thi công"
      },
      {
        title: "Đào móng và xử lý nền",
        weather: "nắng",
        temperature: 30,
        workDescription: "Tiến hành đào móng và xử lý nền móng theo thiết kế",
        workHours: 9,
        workersCount: 20,
        issues: "Đất nền hơi ẩm",
        notes: "Cần chú ý xử lý thoát nước"
      },
      {
        title: "Đổ bê tông móng",
        weather: "mây",
        temperature: 26,
        workDescription: "Đổ bê tông móng và cột theo đúng quy trình",
        workHours: 10,
        workersCount: 25,
        issues: "Không có",
        notes: "Chất lượng bê tông đạt yêu cầu"
      },
      {
        title: "Xây tường gạch",
        weather: "nắng",
        temperature: 32,
        workDescription: "Xây tường gạch và bê tông tầng 1",
        workHours: 8,
        workersCount: 18,
        issues: "Gạch hơi ẩm",
        notes: "Cần phơi gạch trước khi xây"
      },
      {
        title: "Lắp đặt hệ thống điện",
        weather: "mưa nhẹ",
        temperature: 24,
        workDescription: "Lắp đặt hệ thống điện trong nhà",
        workHours: 7,
        workersCount: 12,
        issues: "Mưa ảnh hưởng đến công việc",
        notes: "Cần che chắn thiết bị điện"
      },
      {
        title: "Lắp đặt hệ thống nước",
        weather: "nắng",
        temperature: 29,
        workDescription: "Lắp đặt hệ thống cấp thoát nước",
        workHours: 8,
        workersCount: 10,
        issues: "Không có",
        notes: "Tiến độ đúng kế hoạch"
      },
      {
        title: "Lát nền gạch",
        weather: "nắng",
        temperature: 31,
        workDescription: "Lát nền gạch và đá trang trí",
        workHours: 9,
        workersCount: 15,
        issues: "Không có",
        notes: "Chất lượng lát nền tốt"
      },
      {
        title: "Sơn tường và trang trí",
        weather: "mây",
        temperature: 27,
        workDescription: "Sơn tường và trang trí nội thất",
        workHours: 8,
        workersCount: 8,
        issues: "Không có",
        notes: "Màu sắc đẹp, đúng thiết kế"
      },
      {
        title: "Lắp đặt cửa và cửa sổ",
        weather: "nắng",
        temperature: 28,
        workDescription: "Lắp đặt cửa và cửa sổ nhôm kính",
        workHours: 7,
        workersCount: 6,
        issues: "Không có",
        notes: "Cửa lắp đặt chắc chắn"
      },
      {
        title: "Lắp đặt mái tôn",
        weather: "nắng",
        temperature: 33,
        workDescription: "Lắp đặt mái tôn và hệ thống thoát nước",
        workHours: 9,
        workersCount: 12,
        issues: "Nắng nóng ảnh hưởng",
        notes: "Cần uống nhiều nước"
      },
      {
        title: "Hoàn thiện và dọn dẹp",
        weather: "mây",
        temperature: 25,
        workDescription: "Hoàn thiện các chi tiết và dọn dẹp công trình",
        workHours: 8,
        workersCount: 20,
        issues: "Không có",
        notes: "Công trình gần hoàn thành"
      },
      {
        title: "Kiểm tra và nghiệm thu",
        weather: "nắng",
        temperature: 26,
        workDescription: "Kiểm tra chất lượng và nghiệm thu công trình",
        workHours: 6,
        workersCount: 8,
        issues: "Không có",
        notes: "Công trình đạt yêu cầu kỹ thuật"
      }
    ];

    const createdProjects = [];
    const createdWorkItems = [];
    const createdDailyLogs = [];

    // Create projects
    console.log('📁 Creating Projects...');
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`Creating project ${i + 1}/12: ${project.name}`);
      
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_demo_1',
          'x-user-id': 'test-user-123'
        },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        const data = await response.json();
        const createdProject = data.success ? data.data : data;
        createdProjects.push(createdProject);
        console.log(`✅ Created project: ${createdProject.name} (ID: ${createdProject.id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create project ${i + 1}: ${error}`);
      }
    }

    console.log(`\n📋 Created ${createdProjects.length} projects\n`);

    // Create work items for each project
    console.log('🔧 Creating Work Items...');
    for (const project of createdProjects) {
      console.log(`Creating work items for project: ${project.name}`);
      
      for (let i = 0; i < workItemTemplates.length; i++) {
        const template = workItemTemplates[i];
        const workItem = {
          ...template,
          projectId: project.id,
          status: i < 3 ? 'completed' : i < 6 ? 'in_progress' : 'pending',
          assignedTo: `worker-${(i % 5) + 1}`,
          dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedHours: Math.floor(Math.random() * 40) + 20,
          actualHours: i < 3 ? Math.floor(Math.random() * 40) + 20 : null
        };

        const response = await fetch(`${baseUrl}/api/projects/${project.id}/work-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': 'org_demo_1',
            'x-user-id': 'test-user-123'
          },
          body: JSON.stringify(workItem)
        });

        if (response.ok) {
          const data = await response.json();
          const createdWorkItem = data.success ? data.data : data;
          createdWorkItems.push(createdWorkItem);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create work item: ${error}`);
        }
      }
    }

    console.log(`\n📋 Created ${createdWorkItems.length} work items\n`);

    // Create daily logs for each project
    console.log('📝 Creating Daily Logs...');
    for (const project of createdProjects) {
      console.log(`Creating daily logs for project: ${project.name}`);
      
      for (let i = 0; i < dailyLogTemplates.length; i++) {
        const template = dailyLogTemplates[i];
        const logDate = new Date(Date.now() - (dailyLogTemplates.length - i - 1) * 24 * 60 * 60 * 1000);
        
        const dailyLog = {
          ...template,
          logDate: logDate.toISOString(),
          photos: [] // Empty photos for now
        };

        const response = await fetch(`${baseUrl}/api/projects/${project.id}/daily-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': 'org_demo_1',
            'x-user-id': 'test-user-123'
          },
          body: JSON.stringify(dailyLog)
        });

        if (response.ok) {
          const data = await response.json();
          const createdDailyLog = data.success ? data.data : data;
          createdDailyLogs.push(createdDailyLog);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create daily log: ${error}`);
        }
      }
    }

    console.log(`\n📋 Created ${createdDailyLogs.length} daily logs\n`);

    // Summary
    console.log('🎉 Demo Data Creation Completed!');
    console.log('\n📊 Summary:');
    console.log(`✅ Projects: ${createdProjects.length}/12`);
    console.log(`✅ Work Items: ${createdWorkItems.length}/${projects.length * 12}`);
    console.log(`✅ Daily Logs: ${createdDailyLogs.length}/${projects.length * 12}`);
    
    console.log('\n📋 Project List:');
    createdProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (ID: ${project.id}) - ${project.status}`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Visit /dashboard/projects to see all projects');
    console.log('2. Click on any project to see work items and daily logs');
    console.log('3. Test the refresh functionality');
    console.log('4. Test creating new daily logs and work items');

  } catch (error) {
    console.error('💥 Error creating demo data:', error);
  }
};

createDemoData();
