process.env.NODE_PATH = 'backend/node_modules';
require('module').Module._initPaths();

async function testRoles() {
  const adminController = await import('../backend/controllers/adminController.js');
  const User = (await import('../backend/models/User.js')).default;
  const mongoose = (await import('../backend/node_modules/mongoose/index.js')).default;

  await mongoose.connect('mongodb://127.0.0.1:27017/admify');

  console.log('Testing Central Users Role & Wallet Data Mapping...\n');

  const roles = ['student', 'agency', 'agent', 'university_rep', 'admin'];

  for (const role of roles) {
    let capturedBody = null;
    let capturedStatus = 200;

    const req = {
      query: { role, status: 'all', search: '', page: 1, limit: 10 },
      user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
    };

    const res = {
      status(s) { capturedStatus = s; return this; },
      json(b) { capturedBody = b; return this; },
    };

    await adminController.getAdminUsers(req, res, (err) => { if (err) console.error(err); });

    const users = capturedBody?.data?.users || [];
    console.log(`[TAB: ${role.toUpperCase()}] -> Found: ${users.length} accounts | HTTP ${capturedStatus}`);

    if (users.length > 0) {
      const sample = users[0];
      const isStudent = (sample.role || '').toLowerCase() === 'student';
      const renderedWalletCol = isStudent ? `${sample.walletCredits || 0} CR` : 'N/A';
      console.log(`  Sample User: "${sample.name}" (role: ${sample.role})`);
      console.log(`  Table Column Display: -> [${renderedWalletCol}]`);

      // Test Drawer fetch
      let drawerBody = null;
      const drawerReq = {
        params: { id: sample._id.toString() },
        user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
      };
      const drawerRes = {
        status(s) { return this; },
        json(b) { drawerBody = b; return this; },
      };
      await adminController.getAdminUserById(drawerReq, drawerRes, () => {});
      const related = drawerBody?.data?.related || {};
      console.log(`  Drawer Related Data:`);
      console.log(`    - Applications: ${related.applications?.length ?? 'N/A'}`);
      console.log(`    - Credit Transactions: ${related.creditTransactions?.length ?? 'N/A'}`);
      console.log(`    - Agency Profile: ${related.agencyProfile ? 'Attached' : 'None'}`);
      console.log(`    - Uni Rep Application: ${related.uniRepApplication ? 'Attached' : 'None'}`);
    }
    console.log('');
  }

  // Test Credit Adjustment role protection
  console.log('--- Testing Credit Adjustment Role Guard ---');
  const nonStudent = await User.findOne({ role: { $in: ['agency', 'agent', 'admin'] } });
  if (nonStudent) {
    let adjStatus = 200;
    let adjBody = null;
    const adjReq = {
      body: { userId: nonStudent._id.toString(), amount: 50, reason: 'Unauthorized test adjustment' },
      user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
    };
    const adjRes = {
      status(s) { adjStatus = s; return this; },
      json(b) { adjBody = b; return this; },
    };
    await adminController.adjustUserCredits(adjReq, adjRes, () => {});
    console.log(`Adjust credits on ${nonStudent.role} user ("${nonStudent.name}"):`);
    console.log(`  Status: ${adjStatus} | Success: ${adjBody?.success} | Message: "${adjBody?.message}"`);
    if (adjStatus === 400 && !adjBody?.success) {
      console.log('  [PASS] Non-student credit adjustment successfully blocked by backend!');
    } else {
      console.log('  [FAIL] Non-student credit adjustment was not blocked!');
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

testRoles().catch((err) => {
  console.error(err);
  process.exit(1);
});
