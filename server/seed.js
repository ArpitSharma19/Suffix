const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/db');
const User = require('./src/models/User');
const Content = require('./src/models/Content');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cloudinary = require('./src/config/cloudinary');

const seedData = async () => {
  try {
    await sequelize.sync(); // Ensure tables exist

    // 1. Seed Admin User (updated credentials)
    const adminUsername = 'admin';
    const adminEmail = 'arpitsharma199714@gmail.com';
    const adminPassword = 'password123';

    const existingAdmin = await User.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        isAdmin: true
      });
      console.log('Admin user created with updated credentials');
    } else {
      existingAdmin.email = adminEmail;
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin user updated with new credentials');
    }

    const hasCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
    const assets = path.join(__dirname, '..', 'client', 'src', 'assets');
    const uploadAsset = async (filename, publicId) => {
      if (!hasCloudinary) return '';
      const filePath = path.join(assets, filename);
      if (!fs.existsSync(filePath)) return '';
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          overwrite: true,
          resource_type: 'image'
        });
        return result.secure_url;
      } catch (e) {
        return '';
      }
    };

    const logoUrl = await uploadAsset('logo_suffix.png', 'suffix_seed/logo');
    const heroMain1 = await uploadAsset('main1.png', 'suffix_seed/hero/main1');
    const heroMain2 = await uploadAsset('main2.png', 'suffix_seed/hero/main2');
    const heroMain3 = await uploadAsset('main3.png', 'suffix_seed/hero/main3');
    const partnerLogos = (await Promise.all([
      uploadAsset('keystone.png', 'suffix_seed/partners/keystone'),
      uploadAsset('mis.jpg', 'suffix_seed/partners/mis'),
      uploadAsset('tapestry.jpg', 'suffix_seed/partners/tapestry'),
      uploadAsset('agency.png', 'suffix_seed/partners/agency'),
      uploadAsset('lig.png', 'suffix_seed/partners/lig'),
      uploadAsset('horizon.png', 'suffix_seed/partners/horizon'),
    ])).filter(Boolean);
    const product1 = await uploadAsset('product1.png', 'suffix_seed/products/product1');
    const product2 = await uploadAsset('product2.png', 'suffix_seed/products/product2');
    const product3 = await uploadAsset('product3.png', 'suffix_seed/products/product3');
    const gridExperience = await uploadAsset('experience.jpg', 'suffix_seed/grid/experience');
    const gridInsight = await uploadAsset('insight.jpg', 'suffix_seed/grid/insight');
    const gridInnovate = await uploadAsset('innovate.jpg', 'suffix_seed/grid/innovate');
    const gridAccelerate = await uploadAsset('accelerate.jpg', 'suffix_seed/grid/accelerate');
    const gridAssure = await uploadAsset('assure.jpg', 'suffix_seed/grid/assure');

    const contentData = [
      {
        key: 'navbar',
        value: {
          logo: logoUrl || '',
          menuItems: [
            { text: 'Home', link: '#hero' },
            { text: 'About', link: '#about' },
            { text: 'Work', link: '#products' },
            { text: 'Solutions', link: '#solutions' },
            { text: 'Careers', link: '#careers' },
            { text: 'Contact', link: '#footer' },
            { text: 'Sales Enquire', link: '#', isPrimary: true }
          ]
        }
      },
      {
        key: 'pages',
        value: [
          { id: 'home', name: 'Home', slug: 'home' },
          { id: 'about', name: 'About', slug: 'about' },
          { id: 'products', name: 'Products', slug: 'products' },
          { id: 'solutions', name: 'Solutions', slug: 'solutions' },
          { id: 'careers', name: 'Careers', slug: 'careers' },
          { id: 'contact', name: 'Contact', slug: 'contact' }
        ]
      },
      {
        key: 'hero',
        value: {
          title: 'Delivering Technology That Powers the Next Generation of Public & Enterprise Services',
          subtitle: 'From AI to IoT, we turn modern technology into real transformation — smarter operations, seamless experiences, and measurable growth.',
          buttonText: 'Learn More',
          buttonLink: '#',
          main1: heroMain1 || '',
          main2: heroMain2 || '',
          main3: heroMain3 || '',
          partnerText: "We're proud to partner with the best",
          partnerLogos: partnerLogos
        }
      },
      {
        key: 'about',
        value: {
          heading: 'Our Areas of Expertise',
          subheading: 'We provide tailored solutions that drive success and address challenges in an ever-evolving world.',
          cards: [
            { title: "Artificial Intelligence", description: "We help businesses use AI to work more efficiently and think ahead. From automating everyday tasks to analyzing complex data and building intelligent chatbots — our AI solutions are designed to make technology work for you. We turn data into insights, and insights into action." },
            { title: "Custom Software Development", description: "We guide organizations through every step of their digital journey — modernizing processes, adopting the right tools, and improving how teams and customers connect. Whether you’re upgrading internal systems or creating new digital experiences, we help you move from “how it’s done” to “how it should be." },
            { title: "Digital Transformation", description: "Your business has its own rhythm — your software should match it. Our team designs and develops custom applications that fit your exact needs, from workflow automation to large-scale enterprise platforms. Every line of code we write aims to make your work simpler, faster, and smarter." },
            { title: "Internet of Things (IoT)", description: "We create IoT solutions that bring your physical and digital worlds together. From smart sensors and connected devices to real-time monitoring dashboards, we help businesses gain control, visibility, and efficiency like never before. It’s technology that listens, learns, and acts — in real time." },
          ]
        }
      },
      {
        key: 'products',
        value: {
          heading: 'Our Products',
          subheading: 'We specialize in creating groundbreaking products that optimize operations, stimulate growth, and pave the way for unparalleled success across diverse sectors.',
          cards: [
            {
              title: 'Smart Attendance System',
              subtitle: 'AttendPro',
              description: 'AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.',
              bg: 'bg-1',
              images: product1 || '',
              link: '#'
            },
            {
              title: 'Sanitation Management System',
              subtitle: 'SMART',
              description: 'AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.',
              bg: 'bg-2',
              images: product2 || '',
              link: '#'
            },
            {
              title: 'Vehicle Management System',
              subtitle: 'AutoPro',
              description: 'AttendPro is a smart attendance solution for field teams. It verifies on-site presence with selfie check-ins, GPS and time stamps, and only marks attendance after 7 working hours, keeping records accurate and tamper-proof.',
              bg: 'bg-3',
              images: product3 || '',
              link: '#'
            }
          ]
        }
      },
      {
        key: 'success',
        value: {
          heading: 'Success Stories',
          subheading: 'We specialize in creating groundbreaking products that optimize operations, stimulate growth, and pave the way for unparalleled success across diverse sectors',
          slides: [
            {
              title: "AttendPro — Smarter Attendance for Field Teams",
              description: "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
            },
            {
              title: "AttendPro — Smarter Attendance for Field Teams",
              description: "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
            },
            {
              title: "AttendPro — Smarter Attendance for Field Teams",
              description: "Deployed at Varanasi Nagar Nigam, AttendPro ensures every check-in is real with selfie verification, GPS location, and time-stamped records. Attendance is only marked after completing 7 working hours, bringing discipline and accountability to the workforce. As a result, workers now reach job sites on time, productivity has significantly improved, and fake attendance has been completely stopped — helping the civic body save ₹30–40 lakhs every month while improving public service delivery.",
            }
          ]
        }
      },
      {
        key: 'imageGrid',
        value: {
          experience: { image: gridExperience || '', link: '#' },
          insight: { image: gridInsight || '', link: '#' },
          innovate: { image: gridInnovate || '', link: '#' },
          accelerate: { image: gridAccelerate || '', link: '#' },
          assure: { image: gridAssure || '', link: '#' }
        }
      },
      {
        key: 'footer',
        value: {
          products: [
            { text: "AttendPro - Smart Attendance System", link: "#" },
            { text: "Smart - Sanitation Management System", link: "#" },
            { text: "AutoPro - Vehicle Management System", link: "#" }
          ],
          solutions: [
            { text: "Artificial Intelligence", link: "#" },
            { text: "Custom Software Development", link: "#" },
            { text: "Digital Transformation", link: "#" },
            { text: "Internet of Things (IoT)", link: "#" }
          ],
          company: [
            { text: "About", link: "#" },
            { text: "Awards", link: "#" },
            { text: "Leadership Team", link: "#" },
            { text: "Case Study", link: "#" },
            { text: "Our Clients", link: "#" },
            { text: "Newsroom", link: "#" },
            { text: "Careers", link: "#" },
            { text: "Contact", link: "#" }
          ]
        }
      }
    ];

    for (const item of contentData) {
      const existingContent = await Content.findOne({ where: { key: item.key } });
      if (!existingContent) {
        await Content.create(item);
        console.log(`Seeded content for ${item.key}`);
      } else {
        const existingStr = JSON.stringify(existingContent.value || {});
        const containsPlaceholder = existingStr.includes('via.placeholder.com');
        if (containsPlaceholder) {
          existingContent.value = item.value;
          await existingContent.save();
          console.log(`Updated content for ${item.key}`);
        } else {
          console.log(`Skipped existing content for ${item.key}`);
        }
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
