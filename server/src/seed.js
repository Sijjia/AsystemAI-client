import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

async function seed() {
  // Create admin user
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = $2`,
    [adminUser, hash]
  );
  console.log(`Admin user created: ${adminUser}`);

  // Seed demo projects from partners data
  const projects = [
    {
      slug: 'ministerstvo-obrazovaniya-kr',
      title: 'Цифровизация образования',
      client: 'Министерство образования КР',
      short_description: 'Разработка и внедрение ПО, платформ доступа и систем управления',
      challenge: 'Необходимость масштабной цифровизации системы образования Кыргызской Республики',
      solution: 'Архитектура ПО, интеграция систем, обеспечение безопасности данных, консалтинг',
      result: 'Масштабный государственный проект цифровизации образования',
      cover_image: '/image/герб.svg',
      logo_image: '/image/логотип.png',
      tags: ['Gov', 'Education', 'Digital'],
      is_published: true,
      is_featured: true,
      sort_order: 1,
    },
    {
      slug: 'aurva-crypto',
      title: 'Платформа управления криптоассоциацией',
      client: 'АУРВА',
      short_description: 'Платформы управления членством, безопасность, AML-системы',
      challenge: 'Управление членством и соответствие AML-требованиям для криптоиндустрии',
      solution: 'Разработка платформ управления членством, системы безопасности и AML-мониторинга',
      result: 'Полноценная экосистема для управления ассоциацией криптоиндустрии',
      tags: ['Crypto', 'AML', 'Platform'],
      is_published: true,
      is_featured: true,
      sort_order: 2,
    },
    {
      slug: 'jia-digitalization',
      title: 'Цифровизация ассоциации малого бизнеса',
      client: 'JIA',
      short_description: 'CRM для членства, веб-портал, автоматизация процессов',
      challenge: 'Устаревшие процессы управления членством и обработки заявок',
      solution: 'CRM-система для членства, веб-портал, автоматизация бизнес-процессов',
      result: '+35% регистраций новых членов, -50% время обработки заявок',
      tags: ['CRM', 'Automation', 'Business'],
      is_published: true,
      is_featured: true,
      sort_order: 3,
    },
    {
      slug: 'tulpar-express',
      title: 'Логистическая экосистема',
      client: 'Tulpar Express',
      short_description: 'ПО регистрации, веб-сайт, мобильное приложение, ребрендинг',
      challenge: 'Необходимость комплексной цифровой экосистемы для логистической компании',
      solution: 'Разработка ПО регистрации, веб-сайта, мобильного приложения, полный ребрендинг',
      result: 'Единая цифровая экосистема для логистического бизнеса',
      tags: ['Logistics', 'Mobile', 'Branding'],
      is_published: true,
      is_featured: true,
      sort_order: 4,
    },
    {
      slug: 'red-petroleum',
      title: 'Цифровая трансформация',
      client: 'Red Petroleum',
      short_description: 'Комплексная цифровизация нефтяной компании',
      challenge: 'Модернизация бизнес-процессов нефтяной компании',
      solution: 'Комплексная цифровая трансформация и автоматизация',
      result: 'Современная цифровая инфраструктура для нефтяного бизнеса',
      tags: ['Oil', 'Digital', 'Enterprise'],
      is_published: true,
      is_featured: false,
      sort_order: 5,
    },
  ];

  for (const p of projects) {
    await pool.query(
      `INSERT INTO projects (slug, title, client, short_description, challenge, solution, result,
        cover_image, logo_image, tags, is_published, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.title, p.client, p.short_description, p.challenge, p.solution, p.result,
        p.cover_image || null, p.logo_image || null, JSON.stringify(p.tags),
        p.is_published, p.is_featured, p.sort_order]
    );
    console.log(`Project seeded: ${p.title}`);
  }

  await pool.end();
  console.log('Seed completed');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
