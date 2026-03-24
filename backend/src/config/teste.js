import bcrypt from 'bcryptjs';

async function main() {
  const adminHash = await bcrypt.hash('admin', 10);
  const userHash  = await bcrypt.hash('1234', 10);
  console.log('ADMIN:', adminHash);
  console.log('USER: ', userHash);
}
main();
