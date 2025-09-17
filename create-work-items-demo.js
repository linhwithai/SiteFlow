const createWorkItemsDemo = async () => {
  try {
    console.log('🚀 Creating Work Items Demo Data...\n');
    
    const baseUrl = 'http://localhost:3000';
    const projectId = 40; // Use existing project
    
    // Sample work items data
    const workItemsData = [
      {
        workItemTitle: 'Đào móng và xử lý nền',
        workItemDescription: 'Đào móng theo thiết kế và xử lý nền móng cho công trình',
        workItemType: 'excavation',
        status: 'completed',
        priority: 'high',
        assignedTo: 'Nguyễn Văn A',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        estimatedWorkHours: 80,
        laborCount: 12,
        materials: ['xẻng', 'cuốc', 'xe cút kít', 'máy đào'],
        equipment: ['máy đào mini', 'xe tải'],
        notes: 'Hoàn thành đúng tiến độ, chất lượng đạt yêu cầu'
      },
      {
        workItemTitle: 'Đổ bê tông móng',
        workItemDescription: 'Đổ bê tông móng và cột theo đúng quy trình kỹ thuật',
        workItemType: 'concrete_work',
        status: 'completed',
        priority: 'high',
        assignedTo: 'Trần Văn B',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        estimatedWorkHours: 120,
        laborCount: 15,
        materials: ['xi măng', 'cát', 'đá', 'thép'],
        equipment: ['máy trộn bê tông', 'máy rung'],
        notes: 'Bê tông đạt cường độ yêu cầu, không có lỗi kỹ thuật'
      },
      {
        workItemTitle: 'Xây tường gạch',
        workItemDescription: 'Xây tường gạch và bê tông tầng 1 theo thiết kế',
        workItemType: 'masonry',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'Lê Văn C',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        estimatedWorkHours: 200,
        laborCount: 18,
        materials: ['gạch', 'xi măng', 'cát', 'nước'],
        equipment: ['thước', 'dây dọi', 'bay'],
        notes: 'Tiến độ 60%, chất lượng tốt'
      },
      {
        workItemTitle: 'Lắp đặt hệ thống điện',
        workItemDescription: 'Lắp đặt hệ thống điện trong nhà theo tiêu chuẩn',
        workItemType: 'electrical',
        status: 'planned',
        priority: 'medium',
        assignedTo: 'Phạm Văn D',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        estimatedWorkHours: 150,
        laborCount: 8,
        materials: ['dây điện', 'ổ cắm', 'công tắc', 'tủ điện'],
        equipment: ['kìm', 'tuốc nơ vít', 'máy khoan'],
        notes: 'Chờ hoàn thành xây tường để bắt đầu'
      },
      {
        workItemTitle: 'Lắp đặt hệ thống nước',
        workItemDescription: 'Lắp đặt hệ thống cấp thoát nước',
        workItemType: 'plumbing',
        status: 'planned',
        priority: 'medium',
        assignedTo: 'Hoàng Văn E',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
        estimatedWorkHours: 100,
        laborCount: 6,
        materials: ['ống nước', 'van', 'bồn cầu', 'lavabo'],
        equipment: ['máy cắt ống', 'máy hàn'],
        notes: 'Chuẩn bị vật liệu và thiết bị'
      },
      {
        workItemTitle: 'Lát nền gạch',
        workItemDescription: 'Lát nền gạch và đá trang trí',
        workItemType: 'finishing',
        status: 'planned',
        priority: 'low',
        assignedTo: 'Vũ Văn F',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        estimatedWorkHours: 80,
        laborCount: 10,
        materials: ['gạch lát nền', 'keo dán', 'vữa'],
        equipment: ['máy cắt gạch', 'thước', 'bay'],
        notes: 'Chờ hoàn thành hệ thống điện và nước'
      },
      {
        workItemTitle: 'Sơn tường và trang trí',
        workItemDescription: 'Sơn tường và trang trí nội thất',
        workItemType: 'painting',
        status: 'planned',
        priority: 'low',
        assignedTo: 'Đặng Văn G',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        estimatedWorkHours: 60,
        laborCount: 5,
        materials: ['sơn', 'cọ', 'băng dính', 'giấy nhám'],
        equipment: ['máy phun sơn', 'thang'],
        notes: 'Chuẩn bị màu sơn theo thiết kế'
      },
      {
        workItemTitle: 'Lắp đặt cửa và cửa sổ',
        workItemDescription: 'Lắp đặt cửa và cửa sổ nhôm kính',
        workItemType: 'finishing',
        status: 'planned',
        priority: 'medium',
        assignedTo: 'Bùi Văn H',
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days from now
        estimatedWorkHours: 90,
        laborCount: 6,
        materials: ['cửa', 'cửa sổ', 'kính', 'khóa'],
        equipment: ['máy khoan', 'mức', 'thước'],
        notes: 'Đã đặt hàng cửa và cửa sổ'
      },
      {
        workItemTitle: 'Lắp đặt mái tôn',
        workItemDescription: 'Lắp đặt mái tôn và hệ thống thoát nước',
        workItemType: 'roofing',
        status: 'planned',
        priority: 'high',
        assignedTo: 'Ngô Văn I',
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        estimatedWorkHours: 120,
        laborCount: 12,
        materials: ['tôn', 'xà gồ', 'ốc vít', 'mái che'],
        equipment: ['máy cắt tôn', 'thang', 'dây an toàn'],
        notes: 'Cần thời tiết thuận lợi để thi công'
      },
      {
        workItemTitle: 'Hoàn thiện và dọn dẹp',
        workItemDescription: 'Hoàn thiện các chi tiết và dọn dẹp công trình',
        workItemType: 'cleanup',
        status: 'planned',
        priority: 'low',
        assignedTo: 'Lý Văn K',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        estimatedWorkHours: 40,
        laborCount: 8,
        materials: ['chổi', 'nước rửa', 'túi rác'],
        equipment: ['xe chở rác', 'máy hút bụi'],
        notes: 'Công việc cuối cùng trước khi bàn giao'
      },
      {
        workItemTitle: 'Kiểm tra chất lượng',
        workItemDescription: 'Kiểm tra chất lượng và nghiệm thu công trình',
        workItemType: 'inspection',
        status: 'planned',
        priority: 'high',
        assignedTo: 'Cao Văn L',
        dueDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days from now
        estimatedWorkHours: 20,
        laborCount: 4,
        materials: ['thước đo', 'máy đo', 'giấy nghiệm thu'],
        equipment: ['máy đo độ ẩm', 'máy đo độ nghiêng'],
        notes: 'Kiểm tra toàn bộ công trình theo tiêu chuẩn'
      },
      {
        workItemTitle: 'Bàn giao công trình',
        workItemDescription: 'Bàn giao công trình cho chủ đầu tư',
        workItemType: 'other',
        status: 'planned',
        priority: 'urgent',
        assignedTo: 'Trưởng công trình',
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now
        estimatedWorkHours: 10,
        laborCount: 2,
        materials: ['hồ sơ bàn giao', 'chìa khóa'],
        equipment: ['máy tính', 'máy in'],
        notes: 'Chuẩn bị hồ sơ bàn giao đầy đủ'
      }
    ];

    const createdWorkItems = [];

    // Create work items
    console.log('🔧 Creating Work Items...');
    for (let i = 0; i < workItemsData.length; i++) {
      const workItem = workItemsData[i];
      console.log(`Creating work item ${i + 1}/12: ${workItem.workItemTitle}`);
      
      const response = await fetch(`${baseUrl}/api/projects/${projectId}/work-items`, {
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
        const createdWorkItem = data.workItem || data;
        createdWorkItems.push(createdWorkItem);
        console.log(`✅ Created work item: ${createdWorkItem.workItemTitle} (ID: ${createdWorkItem.id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create work item ${i + 1}: ${error}`);
      }
    }

    console.log(`\n📋 Created ${createdWorkItems.length} work items\n`);

    // Summary
    console.log('🎉 Work Items Demo Data Creation Completed!');
    console.log('\n📊 Summary:');
    console.log(`✅ Work Items: ${createdWorkItems.length}/12`);
    
    console.log('\n📋 Work Items Created:');
    createdWorkItems.forEach((workItem, index) => {
      console.log(`${index + 1}. ${workItem.workItemTitle} (ID: ${workItem.id}) - ${workItem.status}`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Visit /dashboard/projects to see all projects');
    console.log('2. Click on project 40 to see work items');
    console.log('3. Test the work items listing page');
    console.log('4. Test creating, editing, and viewing work items');
    console.log('5. Test work item detail pages');

  } catch (error) {
    console.error('💥 Error creating work items demo data:', error);
  }
};

createWorkItemsDemo();
