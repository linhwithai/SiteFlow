const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { constructionLogSchema } = require('./src/models/Schema');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/siteflow';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function checkDailyLogs() {
  try {
    console.log('🔍 Checking daily logs for project 37...');
    
    // Query daily logs for project 37
    const dailyLogs = await db
      .select()
      .from(constructionLogSchema)
      .where(eq(constructionLogSchema.projectId, 37))
      .orderBy(desc(constructionLogSchema.createdAt));
    
    console.log(`📊 Found ${dailyLogs.length} daily logs for project 37:`);
    
    if (dailyLogs.length > 0) {
      dailyLogs.forEach((log, index) => {
        console.log(`\n📝 Daily Log ${index + 1}:`);
        console.log(`   ID: ${log.id}`);
        console.log(`   Title: ${log.logTitle}`);
        console.log(`   Date: ${log.constructionDate}`);
        console.log(`   Work Hours: ${log.workHours}`);
        console.log(`   Workers Count: ${log.workersCount}`);
        console.log(`   Weather: ${log.weather || 'N/A'}`);
        console.log(`   Temperature: ${log.temperature || 'N/A'}`);
        console.log(`   Issues: ${log.issues || 'N/A'}`);
        console.log(`   Notes: ${log.notes || 'N/A'}`);
        console.log(`   Created By: ${log.createdById}`);
        console.log(`   Created At: ${log.createdAt}`);
        console.log(`   Updated At: ${log.updatedAt}`);
        console.log(`   Organization: ${log.organizationId}`);
      });
    } else {
      console.log('❌ No daily logs found for project 37');
    }
    
    // Also check total count
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(constructionLogSchema)
      .where(eq(constructionLogSchema.projectId, 37));
    
    console.log(`\n📈 Total daily logs count: ${totalCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking daily logs:', error);
  } finally {
    await sql.end();
  }
}

// Import required functions
const { eq, desc } = require('drizzle-orm');

checkDailyLogs();



