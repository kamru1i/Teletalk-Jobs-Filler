(function (globalScope) {
  'use strict';

  const RELIGIONS = [
    'Islam',
    'Hinduism',
    'Buddhism',
    'Christianity',
    'Other'
  ];

  const GENDERS = [
    'Male',
    'Female',
    'Third Gender'
  ];

  const MARITAL_STATUSES = [
    'Single',
    'Married',
    'Other'
  ];

  const YES_NO = ['Yes', 'No'];

  const QUOTAS = [
    'Not Applicable',
    'Child of Freedom Fighter',
    'Child of Martyred Freedom Fighter',
    'Child of War Heroine (Birangana)',
    'Physically Challenged',
    'Ethnic Minority',
    'Third Gender'
  ];

  const DEP_STATUSES = [
    'Not Applicable',
    'Govt. Employee',
    'Semi Govt. Employee',
    'Autonomous',
    'Departmental Candidate'
  ];

  const DISTRICTS = [
    'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura',
    'Brahmanbaria', 'Chandpur', 'Chapai Nawabganj', 'Chattogram', 'Chuadanga',
    "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
    'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore',
    'Jhalakathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna',
    'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
    'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar',
    'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
    'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna',
    'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi',
    'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
    'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
  ];

  const UPAZILAS_BY_DISTRICT = {
    'Bagerhat': [
      'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat',
      'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'
    ],
    'Bandarban': [
      'Alikadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari',
      'Rowangchhari', 'Ruma', 'Thanchi'
    ],
    'Barguna': [
      'Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'TalToli'
    ],
    'Barishal': [
      'Agailihara', 'Babuganj', 'Bakerganj', 'Banari Para',
      'Barishal Sadar (Kotwali)', 'Gaurnadi', 'Hizla', 'Mehendiganj',
      'Muladi', 'Wazirpur'
    ],
    'Bhola': [
      'Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan',
      'Lalmohan', 'Manpura', 'Tazumuddin'
    ],
    'Bogura': [
      'Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali',
      'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajhanpur', 'Sherpur',
      'Shibganj', 'Sonatola'
    ],
    'Brahmanbaria': [
      'Akhaura', 'Ashuganj', 'Banchharampur', 'Bijoynagar',
      'Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'
    ],
    'Chandpur': [
      'Chandpur Sadar', 'Faridganj', 'Haim Char', 'Hajiganj', 'Kachua',
      'Matlab', 'Shahrasti', 'Uttar Matlab'
    ],
    'Chapai Nawabganj': [
      'Bholahat', 'Gomastapur', 'Nachole', 'Nawabganj Sadar', 'Shibganj'
    ],
    'Chattogram': [
      'Akbar Shah', 'Anowara', 'Bakalia', 'Bandar(Chitt. Port)', 'Banshkhali',
      'Bayejid Bostami', 'Boalkhali', 'Chandanish', 'Chandgaon', 'Chawkbazar',
      'Double Mooring', 'EPZ', 'Fatikchhari', 'Halishahar', 'Hathazari',
      'Karnafuli', 'Khulshi', 'Kotwali', 'Lohagara', 'Mirsharai', 'Pahartali',
      'Panchlaish', 'Patenga', 'Patiya', 'Rangunia', 'Raozan', 'Sadarghat',
      'Sandwip', 'Satkania', 'Sitakunda'
    ],
    'Chuadanga': [
      'Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jiban Nagar'
    ],
    "Cox's Bazar": [
      "Cox's Bazar Sadar", 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Pekua',
      'Ramu', 'Teknaf', 'Ukhia'
    ],
    'Cumilla': [
      'Barura', 'Brahaman Para', 'Burichang', 'Chandina', 'Chauddagram',
      'Cumilla Sadar', 'Cumilla Sadar South', 'Daudkandi', 'Debidwar',
      'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monohorganj', 'Muradnagar',
      'Nangalkot', 'Titas'
    ],
    'Dhaka': [
      'Adabor', 'Airport', 'Badda', 'Banani', 'Bangshal', 'Bhashantek',
      'Cantonment', 'Chackbazar', 'Dakshin Khan', 'Darus-Salam', 'Demra',
      'Dhamrai', 'Dhanmondi', 'Dohar', 'Gandaria', 'Gulshan', 'Hatirjheel',
      'Hazaribhag', 'Jattrabari', 'Kadamtoli', 'Kafrul', 'Kalabagan',
      'Kamrangir Char', 'Keraniganj Model', 'Khilgaon', 'Khilkhet', 'Kotwali',
      'Lalbag', 'Mirpur Model', 'Mohammadpur', 'Motijheel', 'Mugda',
      'Nawabganj', 'New Market', 'Pallabi', 'Paltan Model', 'Ramna Model',
      'Rampura', 'Rupnagar', 'Sabujbhag', 'Savar', 'Shah Ali', 'Shahbag',
      'Shahjahanpur', 'Sher e Bangla Nagar', 'Shyampur', 'South Keraniganj',
      'Sutrapur', 'Tejgaon', 'Tejgaon Industrial', 'Turag', 'Uttar Khan',
      'Uttara East', 'Uttara West', 'Vatara', 'Wari'
    ],
    'Dinajpur': [
      'Biral', 'Birampur', 'Birganj', 'Bochaganj', 'Chirirbandar',
      'Dinajpur Sadar', 'Fulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole',
      'Khansama', 'Nawabganj', 'Parbatipur'
    ],
    'Faridpur': [
      'Alfadanga', 'Bhanga', 'Boalmari', 'Char Bhadrasan', 'Faridpur Sadar',
      'Madukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
    ],
    'Feni': [
      'Chhagalnayian', 'Daganbhuyian', 'Feni Sadar', 'Fulgazi', 'Parshuram',
      'Sonagazi'
    ],
    'Gaibandha': [
      'Fulchhari', 'Gaibanda Sadar', 'Gobidaganj', 'Palashbari', 'Sadullapur',
      'Saghatta', 'Sundarganj'
    ],
    'Gazipur': [
      'Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi'
    ],
    'Gopalganj': [
      'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungi Para'
    ],
    'Habiganj': [
      'Ajmiriganj', 'Bahubal', 'Baniachung', 'Chunarughat', 'Habiganj Sadar',
      'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'
    ],
    'Jamalpur': [
      'Bakshiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj',
      'Melandaha', 'Sarishabari'
    ],
    'Jashore': [
      'Abhay Nagar', 'Bagherpara', 'Chowghacha', 'Jhikargacha', 'Keshabpur',
      'Kotwali', 'Manirampur', 'Sharsha'
    ],
    'Jhalakathi': [
      'Jhalakathi Sadar', 'Kanthalia', 'Nalchity', 'Rajapur'
    ],
    'Jhenaidah': [
      'Harinakunda', 'Jhenaidaha Sadar', 'Kaliganj', 'Kotchandpur',
      'Mahespur', 'Shailkupa'
    ],
    'Joypurhat': [
      'Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'
    ],
    'Khagrachhari': [
      'Dighinala', 'Khagrachhari Sadar', 'Lakshmichhari', 'Mahalchhari',
      'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'
    ],
    'Khulna': [
      'Batiaghata', 'Dacope', 'Daulatpur', 'Dighala', 'Dumuria',
      'Khalishpur', 'Khan Jahan Ali', 'Khulna Sadar', 'Koyra', 'Paikgachha',
      'Phultala', 'Rupsa', 'Sonadanga', 'Terokhada'
    ],
    'Kishoreganj': [
      'Austagram', 'Bajitpur', 'Bhairab', 'Hossenpur', 'Itna', 'Karimganj',
      'Katiadi', 'Kishoreganj Sadar', 'Kuliar Char', 'Mithamoin', 'Nikli',
      'Pakundia', 'Tarail'
    ],
    'Kurigram': [
      'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Kurigram Sadar',
      'Nageshwari', 'Phulbari', 'Rajarhat', 'Rajibpur', 'Rowmari', 'Ulipur'
    ],
    'Kushtia': [
      'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar',
      'Mirpur'
    ],
    'Lakshmipur': [
      'Komol Nogor', 'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati'
    ],
    'Lalmonirhat': [
      'Aditmari', 'Hatibanda', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'
    ],
    'Madaripur': [
      'Kalkini', 'Madaripur Sadar', 'Rajoir', 'Shibchar'
    ],
    'Magura': [
      'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'
    ],
    'Manikganj': [
      'Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia',
      'Shibalaya', 'Singair'
    ],
    'Meherpur': [
      'Gangni', 'Meherpur Sadar', 'Mujib Nagar'
    ],
    'Moulvibazar': [
      'Baralekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar',
      'Rajnagar', 'Sreemangal'
    ],
    'Munshiganj': [
      'Gazaria', 'Louhajang', 'Munshiganj Sadar', 'Serajdikhan',
      'Sreenagar', 'Tongibari'
    ],
    'Mymensingh': [
      'Bhalukha', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur',
      'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Mymensingh Sadar', 'Nandail',
      'Phulpur', 'Tarakanda', 'Trishal'
    ],
    'Naogaon': [
      'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Mahadebpur', 'Manda',
      'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar',
      'Sapahar'
    ],
    'Narail': [
      'Kalia', 'Lohagara', 'Narail Sadar'
    ],
    'Narayanganj': [
      'Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Siddirganj',
      'Sonargaon'
    ],
    'Narsingdi': [
      'Belabo', 'Manohardi', 'Narsingdi Sadar', 'Palash', 'Roypura', 'Shibpur'
    ],
    'Natore': [
      'Bagati Para', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Naldanga',
      'Natore Sadar', 'Singra'
    ],
    'Netrokona': [
      'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Khaliajuri',
      'Madan', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'
    ],
    'Nilphamari': [
      'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar',
      'Saidpur'
    ],
    'Noakhali': [
      'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kobirhat',
      'Noakhali Sadar (Sudharam)', 'Senbagh', 'Sonaimuri', 'Subornachhar'
    ],
    'Pabna': [
      'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi',
      'Pabna Sadar', 'Santhia', 'Sujanagar'
    ],
    'Panchagarh': [
      'Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tentulia'
    ],
    'Patuakhali': [
      'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kala Para', 'Mirzaganj',
      'Patuakhali Sadar', 'Rangabali'
    ],
    'Pirojpur': [
      'Bhandaria', 'Indurkani', 'Kawkhali', 'Mathbaria', 'Nazirpur',
      'Nesarabad (Swarupkati)', 'Pirojpur Sadar'
    ],
    'Rajbari': [
      'Baliakandi', 'Goalanda', 'Kalukhali', 'Pangsha', 'Rajbari Sadar'
    ],
    'Rajshahi': [
      'Bagha', 'Baghmara', 'Boalia (Sadar)', 'Charghat', 'Durgapur',
      'Godagari', 'Matihar', 'Mohanpur', 'Paba', 'Puthia', 'Rajpara', 'Tanore'
    ],
    'Rangamati': [
      'Bagaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai',
      'Kawkhali (Betbunia)', 'Langadu', 'Naniarchar', 'Rajasthali',
      'Rangamati Sadar'
    ],
    'Rangpur': [
      'Badarganj', 'Gangachara', 'Kaunia', 'Mitha Pukur', 'Pirgachha',
      'Pirganj', 'Rangpur Sadar', 'Taraganj'
    ],
    'Satkhira': [
      'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar',
      'Shyamnagar', 'Tala'
    ],
    'Shariatpur': [
      'Bhaderganj', 'Damudya', 'Gosairhat', 'Naria', 'Palong(Sadar)', 'Zanjira'
    ],
    'Sherpur': [
      'Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'
    ],
    'Sirajganj': [
      'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Royganj',
      'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullah Para'
    ],
    'Sunamganj': [
      'Bishwambarpur', 'Chhatak', 'Derai', 'Dharmapasha', 'Dowarabazar',
      'Jagannatpur', 'Jamalganj', 'Madhyanagar', 'Shalla',
      'Shantiganj/ Dakshin Sunamganj', 'Sunamganj Sadar', 'Tahirpur'
    ],
    'Sylhet': [
      'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma',
      'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintapur', 'Kanaighat',
      'Osmaninagar', 'Sylhet Sadar', 'Zakiganj'
    ],
    'Tangail': [
      'Basail', 'Bhuapur', 'Delduar', 'Dhonbari', 'Ghatail', 'Gopalpur',
      'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur',
      'Tangail Sadar'
    ],
    'Thakurgaon': [
      'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'
    ]
  };

  const SSC_EXAMS = [
    'S.S.C',
    'Dakhil',
    'S.S.C Vocational',
    'O Level/Cambridge',
    'S.S.C Equivalent',
    'Dakhil Vocational'
  ];

  const HSC_EXAMS = [
    'H.S.C',
    'Alim',
    'Business Management',
    'Diploma-in-Engineering',
    'A Level/Sr. Cambridge',
    'H.S.C Equivalent',
    'Diploma in Medical Technology',
    'H.S.C Vocational',
    'H.S.C (BM)',
    'Diploma in Pharmacy'
  ];

  const SSC_BOARDS = [
    'Barishal',
    'Chattogram',
    'Cumilla',
    'Dhaka',
    'Dinajpur',
    'Jashore',
    'Madrasah',
    'Mymensingh',
    'Rajshahi',
    'Sylhet',
    'Open University',
    'Edexcel International',
    'Cambridge International - IGCE',
    'Pharmacy Council of Bangladesh',
    'The State Medical Faculty of Bangladesh',
    'Bangladesh Technical Education Board (BTEB)',
    'Other'
  ];

  const HSC_BOARDS = [
    'Barishal',
    'Chattogram',
    'Cumilla',
    'Dhaka',
    'Dinajpur',
    'DIBS (Dhaka)',
    'Jashore',
    'Madrasah',
    'Mymensingh',
    'Rajshahi',
    'Sylhet',
    'Open University',
    'Edexcel International',
    'Cambridge International - IGCE',
    'Pharmacy Council of Bangladesh',
    'The State Medical Faculty of Bangladesh',
    'Bangladesh Technical Education Board (BTEB)',
    'Other'
  ];

  const SSC_GROUPS = [
    'Science',
    'Humanities',
    'Business Studies',
    'General',
    'Agro-Based Food',
    'Architectural Drafting with CAD',
    'Automotive',
    'Building Maintenance',
    'Ceramic',
    'Civil Construction',
    'Civil Drafting with CAD',
    'Computer and Information Technology',
    'Dress Making',
    'Dyeing, Printing and Finishing',
    'Electrical Maintenance Works',
    'Farm Machinery',
    'Fish Culture and Breeding',
    'Food Processing and Preservation',
    'Fruit and Vegetable Cultivation',
    'General Electrical Works',
    'General Electronics',
    'General Mechanics',
    'Glass',
    'Knitting',
    'Livestock Rearing and Farming',
    'Machine Tools Operation',
    'Mechanical Drafting with CAD',
    'Patient Care Technique',
    'Plumbing and Pipe Fittings',
    'Poultry Rearing and Farming',
    'Refrigeration and Air Conditioning',
    'Shrimp Culture and Breeding',
    'Welding and Fabrication',
    'Wood Working',
    'Other'
  ];

  const HSC_GROUPS = [
    'Science',
    'Humanities',
    'Business Studies',
    'General',
    'Agriculture Technology',
    'Agro Machinery',
    'Architecture and Interior Design Technology',
    'Automobile',
    'Automobile Technology',
    'Building Construction and Maintenance',
    'Ceramic Technology',
    'Chemical Technology',
    'Civil Technology',
    'Clothing and Garments Finishing',
    'Computer Operation and Maintenance',
    'Computer Science & Engineering Technology',
    'Computer Science Technology',
    'Data Telecommunication and Network Technology',
    'Dental',
    'Drafting Civil',
    'Electrical and Electronics Technology',
    'Electrical Technology',
    'Electrical Works and Maintenance',
    'Electro-Medical Technology',
    'Electronic Control and Communication',
    'Electronics Technology',
    'Environmental Technology',
    'Firm Machinery',
    'Fish Culture and Breeding',
    'Food',
    'Food Technology',
    'Garments Design and Pattern Making',
    'General Mechanics',
    'Glass Technology',
    'Graphic Design Technology',
    'Industrial Wood Working',
    'Information and Communication Technology',
    'Instrumentation & Process Control Technology',
    'Jute Technology',
    'Laboratory',
    'Library Science',
    'Machine Tools Operation and Maintenance',
    'Marine Technology',
    'Mechanical Technology',
    'Mechatronics',
    'Mechatronics Technology',
    'Mining & Mine Survey Technology',
    'Pharmacy',
    'Physiotherapy',
    'Poultry Rearing and Farming',
    'Power Technology',
    'Printing Technology',
    'Radiography',
    'Radiotherapy',
    'Refrigeration & Air Conditioning Technology',
    'Refrigeration and Air-conditioning',
    'Shipbuilding Technology',
    'Survey',
    'Telecommunication Technology',
    'Textile Engineering',
    'Welding and Fabrication',
    'Other'
  ];

  const SSC_RESULT_TYPES = [
    'GPA(out of 5)',
    'GPA(out of 4)',
    '1st Division',
    '2nd Division',
    '3rd Division'
  ];

  const HSC_RESULT_TYPES = [
    'GPA(out of 5)',
    'GPA(out of 4)',
    '1st Division',
    '2nd Division',
    '3rd Division',
    'Passed'
  ];

  const GRA_EXAMS = [
    'B.Sc Engineering',
    'B.Sc in Agricultural Science',
    'M.B.B.S./B.D.S',
    'Honors',
    'Pass Course',
    'Fazil',
    'B.B.A',
    'Graduation Equivalent'
  ];

  const MAS_EXAMS = [
    'M.A',
    'M.S.S',
    'M.Sc',
    'M.Com',
    'M.B.A',
    'L.L.M',
    'Kamil',
    'Masters Equivalent'
  ];

  const GRA_RESULT_TYPES = [
    'CGPA(out of 4)',
    'CGPA(out of 5)',
    '1st Class',
    '2nd Class',
    '3rd Class',
    'Passed'
  ];

  const MAS_RESULT_TYPES = [
    'CGPA(out of 4)',
    'CGPA(out of 5)',
    '1st Class',
    '2nd Class',
    '3rd Class'
  ];

  const GRA_DURATIONS = [
    '03 Years',
    '04 Years',
    '05 Years'
  ];

  const MAS_DURATIONS = [
    '01 Year',
    '1.5 Years',
    '02 Years',
    '2.5 Years',
    '03 Years',
    '3+ Years'
  ];

  const EMPLOYMENT_TYPES = [
    'Regular Basis Under Revenue Budget',
    'Ad-hoc Basis Under Revenue Budget',
    'Temporary Basis Under Revenue Budget',
    'Work Charged Basis Under Revenue Budget',
    'Temporary Basis Under Development Project',
    'Work Charged Basis Under Development Project',
    'Autonomous/Semi Autonomous Organization',
    'Private Organization',
    'Business/Self Employed'
  ];

  const PASSING_YEARS = [];
  for (let y = 2030; y >= 1980; y--) {
    PASSING_YEARS.push(String(y));
  }

  const UNIVERSITIES = [
    'Ad-din Womens Medical College, Dhaka',
    'Ahsania Mission University of Science and Technology',
    'Ahsanullah University of Science and Technology',
    'America Bangladesh University',
    'American International University Bangladesh',
    'Anwer Khan Modern Medical College, Dhaka',
    'Anwer Khan Modern University',
    'ASA University Bangladesh',
    'Asian University for Women',
    'Asian University of Bangladesh',
    'Atish Dipankar University of Science & Technology',
    'Aviation and Aerospace University, Bangladesh (AAUB)',
    'Bandarban University',
    'Bangladesh Agricultural University,Mymensingh',
    'Bangladesh Airlines Training Centre (BATC)',
    'Bangladesh Army International University of Science & Technology(BAIUST) ,Comilla',
    'Bangladesh Army University of Engineering and Technology (BAUET), Qadirabad',
    'Bangladesh Army University of Science and Technology(BAUST), Saidpur',
    'Bangladesh Islami University',
    'Bangladesh Maritime University',
    'Bangladesh Medical College',
    'Bangladesh Medical University',
    'Bangladesh Open University',
    'Bangladesh University',
    'Bangladesh University of Business & Technology (BUBT)',
    'Bangladesh University of Engineering & Technology',
    'Bangladesh University of Health Sciences',
    'Bangladesh University of Professionals',
    'Bangladesh University of Textiles',
    'Barisal University',
    'Barishal Engineering College',
    'Begum Rokeya University, Rangpur',
    'BGC Trust Medical College, Chittagong',
    'BGC Trust University Bangladesh, Chittagong',
    'BGMEA University of Fashion & Technology(BUFT)',
    'BRAC University',
    'Britannia University',
    'Canadian University of Bangladesh',
    'CCN University of Science & Technology',
    'Central Medical College, Comilla',
    'Central University of Science and Technology',
    "Central Women's University",
    'Chandpur Science and Technology University',
    'Chittagong Independent University',
    'Chittagong Medical College',
    'Chittagong Medical University',
    'Chittagong University of Engineering & Technology',
    'Chittagong Veterinary and Animal Sciences University',
    'Chottagram Ma-O-Shishu Hospital Medical College',
    'City University',
    'Comilla Medical College',
    'Comilla University',
    'Community Based Medical College (cbmc), Mymensingh',
    'Community Medical College, Dhaka',
    "Cox's Bazar International University",
    "Cox's Bazar Medical College",
    'Daffodil International University',
    'Darul Ihsan University',
    'Delta Medical College, Dhaka',
    'Dhaka International University',
    'Dhaka Medical College',
    'Dhaka National Medical College',
    'Dhaka University',
    'Dhaka University of Engineering & Technology',
    'Dinajpur Medical College',
    "Durra Samad Rahman Red Crescent Women's Medical College, Sylhet",
    'East Delta University , Chittagong',
    'East West University',
    'Eastern Medical College, Comilla',
    'Eastern University',
    'Enam Medical College, Savar, Dhaka',
    'European University of Bangladesh',
    'Exim Bank Agricultural University, Bangladesh',
    'Fareast International University',
    'Faridpur Engineering College',
    'Faridpur Medical College',
    'Feni Medical College,Feni',
    'Feni University',
    'First Capital University of Bangladesh',
    'Gazipur Agricultural University',
    'Gazipur Digital University',
    'German University Bangladesh',
    'Global University Bangladesh',
    'Gono Bishwabidyalay, Savar, Dhaka',
    'Gopalganj Science and Technology University',
    'Green Life Medical College, Dhaka',
    'Green University of Bangladesh',
    'Hajee Mohammad Danesh Science & Technology University',
    'Hamdard University Bangladesh',
    'Hobiganj Agricultural University',
    'Holy Family Red Crescent Medical College, Dhaka',
    'IBAIS University',
    'Ibn Sina Medical College, Dhaka',
    'Ibrahim Medical College, Dhaka',
    'Independent University, Bangladesh',
    'International Islamic University, Chittagong',
    'International Medical College, Gazipur',
    'International Standard University',
    'International University of Business Agriculture & Technology',
    'Ishakha International University, Bangladesh',
    'Islami Bank Medical College, Rajshahi',
    'Islamic Arabic University',
    'Islamic University',
    'Islamic University of Technology',
    'Islamic University of Technology, Gazipur',
    'Islamic University, Bangladesh',
    'Islamic University, Kushtia',
    'Jagannath University',
    'Jahangirnagar University',
    'Jahurul Islam Medical College, Kishoregonj',
    'Jalalabad Ragib-Rabeya Medical College, Sylhet',
    'Jamalpur Science and Technology University',
    'Jatiya Kabi Kazi Nazrul Islam University',
    'Jessore Medical College',
    'Jessore Science & Technology University',
    'Jessore University of Science & Technology',
    'Khawja Yunus Ali Medical College, Sirajganj',
    'Khulna Agricultural University',
    'Khulna Khan Bahadur Ahsanullah University',
    'Khulna Medical College',
    'Khulna University',
    'Khulna University of Engineering and Technology',
    'Khwaja Yunus Ali University',
    'Kishoreganj University',
    'Kumudini Medical College, Tangail',
    'Kushtia Medical College',
    'Labaid Medical College, Dhanmondi, Dhaka',
    'Leading University, Sylhet',
    'MAG Osmani Medical College',
    'Manarat International University',
    'Maulana Bhasani Medical College',
    'Mawlana Bhashani Science & Technology University',
    'Medical College for Women and Hospital, Dhaka',
    'Metropolitan University, Sylhet',
    'Microland University of Science and Technology',
    'Military Institute of Science and Technology (MIST)',
    'Mymensingh Engineering College',
    'Mymensingh Medical College',
    'N.P.I University of Bangladesh',
    'National University',
    'Nightingale Medical College, Dhaka',
    'Noakhali Medical College',
    'Noakhali Science & Technology University',
    'North Bengal International University',
    'North Bengal Medical College, Sirajganj',
    'North East Medical College, Sylhet',
    'North East University Bangladesh',
    'North South University',
    'North Western University',
    'Northern International Medical College, Dhaka',
    'Northern Private Medical College, Rangpur',
    'Northern University Bangladesh',
    'Northern University of Business & Technology, Khulna',
    'Notre Dame University Bangladesh',
    'Pabna Medical College',
    'Pabna University of Science and Technology',
    'Patuakhali Science And Technology University',
    'Popular Medical College & Hospital, Dhaka',
    'Port City International University',
    'Premier University, Chittagong',
    'Presidency University',
    'Prime Medical College, Rangpur',
    'Prime University',
    'Primeasia University',
    'Pundra University of Science & Technology',
    'Queens University',
    'R.T.M Al-Kabir Technical University',
    'Rabindra Maitree University, Kushtia',
    'Rabindra University, Bangladesh',
    'Rajshahi Medical College',
    'Rajshahi Medical University',
    'Rajshahi Science & Technology University (RSTU), Natore',
    'Rajshahi University',
    'Rajshahi University of Engineering & Technology',
    'Ranada Prasad Shaha University',
    'Rangamati Science and Technology University',
    'Rangpur Community Hospital Medical College',
    'Rangpur Medical College',
    'Rangpur University',
    'Royal University of Dhaka',
    'Rupayan A.K.M Shamsuzzoha University',
    'Sahabuddin Medical College and Hospital',
    'Samaj Vittik Medical College, Mirzanagar, Savar',
    'Satkhira Medical College',
    'Shah Makhdum Management University, Rajshahi',
    'Shahabuddin Medical College, Dhaka',
    'Shaheed Nazrul Islam Medical College',
    'Shaheed Suhrawardy Medical College',
    'Shaheed Ziaur Rahman Medical College',
    'Shahjalal University of Science & Technology',
    'Shanto Mariam University of Creative Technology',
    'Sheikh Fazilatunnesa Mujib University',
    'Sheikh Hasina University',
    'Sheikh Sayera Khatun Medical College, Gopalganj',
    'Sher-e-Bangla Agricultural University',
    'Sher-E-Bangla Medical College',
    'Sir Salimullah Medical College',
    'Sonargaon University',
    'South Asian University',
    'Southeast University',
    'Southern Medical College, Chittagong',
    'Southern University Bangladesh',
    'Southern University of Bangladesh, Chittagong',
    'Stamford University, Bangladesh',
    'State University Of Bangladesh',
    'Sylhet Agricultural University',
    'Sylhet Engineering College',
    'Sylhet International University, Sylhet',
    'Sylhet Medical University',
    "Sylhet Women's Medical College, Sylhet",
    'Tagore University of Creative Arts, Uttara, Dhaka, Bangladesh',
    'Tairunnessa Memorial Medical College, Gazipur',
    'The Millennium University',
    'The Peoples University of Bangladesh',
    'The University of Asia Pacific',
    'Times University, Bangladesh',
    'TMSS Medical College,Bogra',
    'Trust University, Barishal',
    'United International University',
    'University of Asia Pacific',
    'University of Barisal',
    'University of Brahmanbaria',
    'University of Chittagong',
    'University of Creative Technology, Chittagong',
    'University of Development Alternative',
    'University of Dhaka',
    'University of Global Village',
    'University of Information Technology & Sciences',
    'University of Liberal Arts Bangladesh',
    'University of Rajshahi',
    'University of Scholars',
    'University of Science & Technology, Chittagong',
    'University of Skill Enrichment and Technology',
    'University of South Asia',
    'Uttara Adhunik Medical College,Dhaka',
    'Uttara University',
    'Varendra University',
    'Victoria University of Bangladesh',
    'World University of Bangladesh',
    "Z. H. Sikder Women's Medical College",
    'Z.H Sikder University of Science & Technology',
    'Z.N.R.F. University of Management Sciences',
    'Other'
  ];

  const BASE_SUBJECTS = [
    'Accounting',
    'Accounting and Information Systems',
    'Aeronautical Engineering',
    'Agr.Co-operative & Marketing',
    'Agriculture',
    'Agriculture Chemistry',
    'Agriculture Co-operatives',
    'Agriculture Economics',
    'Agriculture Engineering',
    'Agriculture Extension',
    'Agriculture Finance',
    'Agriculture Marketing',
    'Agriculture Science',
    'Agriculture Soil Science',
    'Agriculture Statistics',
    'Agriculture Water Management',
    'Agro Forestry',
    'Agronnomy',
    'Agronomy & Aquaculture',
    'Agronomy & Aquaculture Extension',
    'Akaid',
    'Anatomology',
    'Anatomy & Histology',
    'Animal Breeding & Genetic',
    'Animal Husbandry',
    'Animal Nutrition',
    'Animal Science',
    'Anthropology',
    'Applied Chemistry',
    'Applied Mathematics',
    'Applied Physics',
    'Arabic',
    'Archaeology',
    'Architecture',
    'Bangla',
    'Banking',
    'Banking and Insurance',
    'Bio-Technology',
    'Biochemistry',
    'Botany',
    'Business Administration',
    'Business Studies',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Clinical Psychology',
    'Communication Disorders',
    'Computer Engineering',
    'Computer Science',
    'Computer Science & Engineering',
    'Computer Science & Information Technology',
    'Corp Botany',
    'Criminology',
    'Criminology & Police Science',
    'Dairy Science',
    'Development Studies',
    'Disaster Science and Management',
    'Doc.of Veterinary Science',
    'Drama & Music',
    'Drawing and Printing',
    'Economics',
    'Education',
    'Electrical & Electronics Engineering',
    'Electrical Engineering',
    'Electronic Engineering',
    'Electronics & Communication Engineering',
    'Electronics & Telecommunication Engineering',
    'English',
    'Environmental Engineering',
    'Environmental science',
    'Environmental Science and Disaster Management',
    'Ethics',
    'Farm Power & Machinery',
    'Farm Structure',
    'Fikha',
    'Finance',
    'Finance and Banking',
    'Fine Arts',
    'Fisheries',
    'Fisheries & Aquaculture',
    'Fisheries Biology',
    'Fisheries Management',
    'Fisheries Technology',
    'Folklore',
    'Food and Process Engineering',
    'Food Tech. & Rural Industry',
    'Food Technology and Nutrition Science',
    'Food Technology and Nutritional Science',
    'Forestry',
    'Genetic and Breeding',
    'Genetic Engineering',
    'Genetic Engineering and Biotechnology',
    'Geography',
    'Geography and Environmental Science',
    'Geology/Geology and Mining',
    'Glass and Ceramic Engineering',
    'Government and Politics',
    'Graphics',
    'Hadith',
    'History',
    'History of Music',
    'Home Economics',
    'Horticulture',
    'Human Resource Management',
    'Industrial Arts',
    'Industrial Engineering',
    'Information and Communication Engineering',
    'Information and Communication Technology',
    'Information Science and Library Management',
    'Information Technology',
    'International Business',
    'International Law',
    'International Relations',
    'Islamic History and Culture',
    'Islamic Studies',
    'Language/Linguistic',
    'Law/Jurisprudence',
    'Leather Engineering',
    'Livestock',
    'Management',
    'Management Information Systems',
    'Marine Engineering',
    'Marine Science',
    'Marketing',
    'Mass Comm. & Journalism',
    'Materials Science & Engineering',
    'Mathematics',
    'Mechanical Engineering',
    'Medical Physics and Biomedical Engineering',
    'Medical Technology',
    'Metallurgical Engineering',
    'Meteorology',
    'Microbiology',
    'Microbiology & Hygenic',
    'Microwave Engineering',
    'Mineral Engineering',
    'Mining Engineering',
    'Modern Arabic',
    'Naval Architecture & Marine Engineering',
    'Nuclear Engineering',
    'Nutrition & Food Science',
    'Oceanography',
    'Organization Strategy and Leadership',
    'Pali',
    'Paratrology',
    'Peace & Conflict',
    'Persian',
    'Petroleum & Mining Engineering',
    'Pharmaceutical Chemistry',
    'Pharmacy',
    'Philosophy',
    'Physical Planning',
    'Physics',
    'Plant Pathology',
    'Political Science',
    'Population Science',
    'Population Science and Human Resource Development (RU)',
    'Poultry Science',
    'Printing and Publication Studies',
    'Production Economics',
    'Psychology',
    'Public Administration',
    'Public Finance',
    'Regional Planning',
    'Rural Sociology',
    'Sanskrit',
    'Social Welfare/Social Work',
    'Social Works',
    'Sociology',
    'Software Engineering',
    'Soil Water and Environment Science',
    'Statistics',
    'Structural Engineering',
    'Surgery & Obstate',
    'Tafsir',
    'Telecommunication Engineering',
    'Television, Film and Photography',
    'Textile Engineering',
    'Tourism and Hospitality Management',
    'Town Planning',
    'Urban & Regional Planning',
    'Urban Development',
    'Urdu',
    'Water & Environment Science',
    'Water Resource Engineering',
    'Women and Gender Studies',
    'Women Studies',
    'World Religion',
    'Zoology'
  ];

  const GRA_ONLY_DEGREES = [
    'A & B Section of A.M.I.E',
    'B.A',
    'B.B.A',
    'B.B.S',
    'B.com',
    'B.S.S',
    'B.Sc',
    'Dental Surgery',
    'L.L.B',
    'Medicine & Surgery'
  ];

  const GRA_SUBJECTS = [...GRA_ONLY_DEGREES, ...BASE_SUBJECTS].sort((a, b) => a.localeCompare(b));
  GRA_SUBJECTS.push('Other');

  const MAS_SUBJECTS = [...BASE_SUBJECTS].sort((a, b) => a.localeCompare(b));
  MAS_SUBJECTS.push('Other');

  const TeletalkData = {
    RELIGIONS,
    GENDERS,
    MARITAL_STATUSES,
    YES_NO,
    QUOTAS,
    DEP_STATUSES,
    DISTRICTS,
    UPAZILAS_BY_DISTRICT,
    SSC_EXAMS,
    HSC_EXAMS,
    SSC_BOARDS,
    HSC_BOARDS,
    SSC_GROUPS,
    HSC_GROUPS,
    SSC_RESULT_TYPES,
    HSC_RESULT_TYPES,
    GRA_EXAMS,
    MAS_EXAMS,
    GRA_RESULT_TYPES,
    MAS_RESULT_TYPES,
    GRA_DURATIONS,
    MAS_DURATIONS,
    EMPLOYMENT_TYPES,
    PASSING_YEARS,
    UNIVERSITIES,
    GRA_SUBJECTS,
    MAS_SUBJECTS
  };

  if (typeof window !== 'undefined') {
    window.TeletalkData = TeletalkData;
  }
  if (typeof globalScope !== 'undefined') {
    globalScope.TeletalkData = TeletalkData;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeletalkData;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
