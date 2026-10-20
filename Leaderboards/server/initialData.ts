import { TeamEntity, BracketNode, TournamentState } from '../src/types/tournament';

export const TEAMS: TeamEntity[] = [
  {
    id: 'team-sen',
    name: 'Sentinels',
    tag: 'SEN',
    seed: 1,
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop&crop=faces',
    region: 'Americas',
    captainId: 'p-tenz',
    captainName: 'TenZ',
    color: '#EF4444',
    stats: { matchesWon: 4, matchesLost: 0, mapsWon: 8, mapsLost: 2 },
    roster: [
      { id: 'p-tenz', name: 'Tyson Ngo', handle: 'TenZ', role: 'Flex / Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TenZ', country: 'CA' },
      { id: 'p-zekken', name: 'Zachary Patrone', handle: 'zekken', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zekken', country: 'US' },
      { id: 'p-sacy', name: 'Gustavo Rossi', handle: 'Sacy', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sacy', country: 'BR' },
      { id: 'p-johnqt', name: 'Amine Ouarid', handle: 'johnqt', role: 'IGL / Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=johnqt', country: 'MA' },
      { id: 'p-zellsis', name: 'Jordan Montemurro', handle: 'Zellsis', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zellsis', country: 'US' }
    ]
  },
  {
    id: 'team-prx',
    name: 'Paper Rex',
    tag: 'PRX',
    seed: 2,
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop',
    region: 'Pacific',
    captainId: 'p-f0rsaken',
    captainName: 'f0rsakeN',
    color: '#06B6D4',
    stats: { matchesWon: 3, matchesLost: 1, mapsWon: 7, mapsLost: 3 },
    roster: [
      { id: 'p-f0rsaken', name: 'Jason Susanto', handle: 'f0rsakeN', role: 'Flex / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=f0rsaken', country: 'ID' },
      { id: 'p-jinggg', name: 'Wang Jing Jie', handle: 'Jinggg', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jinggg', country: 'SG' },
      { id: 'p-mindfreak', name: 'Aaron Leonhart', handle: 'mindfreak', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mindfreak', country: 'ID' },
      { id: 'p-d4v41', name: 'Khalish Rusyaidi', handle: 'd4v41', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=d4v41', country: 'MY' },
      { id: 'p-something', name: 'Ilya Petrov', handle: 'something', role: 'Sniper / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=something', country: 'RU' }
    ]
  },
  {
    id: 'team-fnc',
    name: 'Fnatic',
    tag: 'FNC',
    seed: 3,
    logo: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-boaster',
    captainName: 'Boaster',
    color: '#F97316',
    stats: { matchesWon: 3, matchesLost: 1, mapsWon: 6, mapsLost: 3 },
    roster: [
      { id: 'p-boaster', name: 'Jake Howlett', handle: 'Boaster', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Boaster', country: 'GB' },
      { id: 'p-derke', name: 'Nikita Sirmitev', handle: 'Derke', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Derke', country: 'FI' },
      { id: 'p-alfajer', name: 'Emir Ali Beder', handle: 'Alfajer', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alfajer', country: 'TR' },
      { id: 'p-chronicle', name: 'Timofey Khromov', handle: 'Chronicle', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chronicle', country: 'RU' },
      { id: 'p-crashies', name: 'Leo Jannesson', handle: 'Leo', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Leo', country: 'SE' }
    ]
  },
  {
    id: 'team-gen',
    name: 'Gen.G Esports',
    tag: 'GEN',
    seed: 4,
    logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&h=100&fit=crop',
    region: 'Pacific',
    captainId: 'p-munchkin',
    captainName: 'Munchkin',
    color: '#EAB308',
    stats: { matchesWon: 2, matchesLost: 1, mapsWon: 5, mapsLost: 3 },
    roster: [
      { id: 'p-munchkin', name: 'Byeon Sang-beom', handle: 'Munchkin', role: 'IGL / Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Munchkin', country: 'KR' },
      { id: 'p-t3xture', name: 'Kim Na-ra', handle: 't3xture', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=t3xture', country: 'KR' },
      { id: 'p-meteor', name: 'Kim Tae-o', handle: 'Meteor', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Meteor', country: 'KR' },
      { id: 'p-lakia', name: 'Kim Jong-min', handle: 'Lakia', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lakia', country: 'KR' },
      { id: 'p-karon', name: 'Kim Won-tae', handle: 'Karon', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Karon', country: 'KR' }
    ]
  },
  {
    id: 'team-tl',
    name: 'Team Liquid',
    tag: 'TL',
    seed: 5,
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-jamppi',
    captainName: 'Jamppi',
    color: '#3B82F6',
    stats: { matchesWon: 2, matchesLost: 1, mapsWon: 4, mapsLost: 3 },
    roster: [
      { id: 'p-jamppi', name: 'Elias Olkkonen', handle: 'Jamppi', role: 'IGL / Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jamppi', country: 'FI' },
      { id: 'p-nats', name: 'Ayaz Akhmetshin', handle: 'nAts', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nAts', country: 'RU' },
      { id: 'p-keiko', name: 'Georgio Sanassy', handle: 'Keiko', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Keiko', country: 'GB' },
      { id: 'p-enzo', name: 'Enzo Mestari', handle: 'Enzo', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Enzo', country: 'FR' },
      { id: 'p-mistic', name: 'James Orfila', handle: 'Mistic', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mistic', country: 'GB' }
    ]
  },
  {
    id: 'team-drx',
    name: 'DRX Vision',
    tag: 'DRX',
    seed: 6,
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    region: 'Pacific',
    captainId: 'p-mako',
    captainName: 'MaKo',
    color: '#2563EB',
    stats: { matchesWon: 2, matchesLost: 1, mapsWon: 5, mapsLost: 4 },
    roster: [
      { id: 'p-mako', name: 'Kim Myeong-kwan', handle: 'MaKo', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MaKo', country: 'KR' },
      { id: 'p-buzz', name: 'Yu Byung-chul', handle: 'BuZz', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BuZz', country: 'KR' },
      { id: 'p-foxy9', name: 'Jung Jae-sung', handle: 'Foxy9', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Foxy9', country: 'KR' },
      { id: 'p-flashback', name: 'Cho Min-hyuk', handle: 'Flashback', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Flashback', country: 'KR' },
      { id: 'p-beyn', name: 'Kang Ha-bin', handle: 'BeYN', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BeYN', country: 'KR' }
    ]
  },
  {
    id: 'team-edg',
    name: 'EDward Gaming',
    tag: 'EDG',
    seed: 7,
    logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop',
    region: 'China',
    captainId: 'p-chichoo',
    captainName: 'CHICHOO',
    color: '#DC2626',
    stats: { matchesWon: 3, matchesLost: 0, mapsWon: 6, mapsLost: 1 },
    roster: [
      { id: 'p-chichoo', name: 'Wan Shunzhi', handle: 'CHICHOO', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CHICHOO', country: 'CN' },
      { id: 'p-zmjjkk', name: 'Zheng Yongkang', handle: 'ZmjjKK', role: 'Sniper / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ZmjjKK', country: 'CN' },
      { id: 'p-nobody', name: 'Wang Senxu', handle: 'nobody', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nobody', country: 'CN' },
      { id: 'p-smoggy', name: 'Zhang Zhao', handle: 'Smoggy', role: 'Flex / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Smoggy', country: 'CN' },
      { id: 'p-s1mon', name: 'Hsieh Meng-hsun', handle: 'S1Mon', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=S1Mon', country: 'TW' }
    ]
  },
  {
    id: 'team-c9',
    name: 'Cloud9 HyperX',
    tag: 'C9',
    seed: 8,
    logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&h=100&fit=crop',
    region: 'Americas',
    captainId: 'p-vanity',
    captainName: 'vanity',
    color: '#0284C7',
    stats: { matchesWon: 1, matchesLost: 1, mapsWon: 3, mapsLost: 2 },
    roster: [
      { id: 'p-vanity', name: 'Anthony Malaspina', handle: 'vanity', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=vanity', country: 'US' },
      { id: 'p-oxy', name: 'Francis Hoang', handle: 'OXY', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=OXY', country: 'US' },
      { id: 'p-xeppaa', name: 'Erick Bach', handle: 'Xeppaa', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Xeppaa', country: 'US' },
      { id: 'p-runi', name: 'Dylan Cade', handle: 'runi', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=runi', country: 'US' },
      { id: 'p-moose', name: 'Kaleb Jayne', handle: 'moose', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=moose', country: 'CA' }
    ]
  },
  {
    id: 'team-blg',
    name: 'Bilibili Gaming',
    tag: 'BLG',
    seed: 9,
    logo: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=100&h=100&fit=crop',
    region: 'China',
    captainId: 'p-whzy',
    captainName: 'whzy',
    color: '#06B6D4',
    stats: { matchesWon: 1, matchesLost: 1, mapsWon: 2, mapsLost: 3 },
    roster: [
      { id: 'p-whzy', name: 'Wang Haozhe', handle: 'whzy', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=whzy', country: 'CN' },
      { id: 'p-knight', name: 'Liu Yuxiang', handle: 'Knight', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Knight', country: 'CN' },
      { id: 'p-yosemite', name: 'Wang Lei', handle: 'Yosemite', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Yosemite', country: 'CN' },
      { id: 'p-nephh', name: 'Marcus Tan', handle: 'nephh', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nephh', country: 'SG' },
      { id: 'p-b3ar', name: 'Yang Zhanxiong', handle: 'B3Ar', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=B3Ar', country: 'CN' }
    ]
  },
  {
    id: 'team-nrg',
    name: 'NRG Shockwave',
    tag: 'NRG',
    seed: 10,
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&h=100&fit=crop',
    region: 'Americas',
    captainId: 'p-crashies_nrg',
    captainName: 'crashies',
    color: '#64748B',
    stats: { matchesWon: 1, matchesLost: 1, mapsWon: 3, mapsLost: 3 },
    roster: [
      { id: 'p-crashies_nrg', name: 'Austin Roberts', handle: 'crashies', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=crashies', country: 'US' },
      { id: 'p-victor', name: 'Victor Wong', handle: 'Victor', role: 'Flex / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Victor', country: 'US' },
      { id: 'p-marved', name: 'Jimmy Nguyen', handle: 'Marved', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marved', country: 'CA' },
      { id: 'p-ethan', name: 'Ethan Arnold', handle: 'Ethan', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ethan', country: 'US' },
      { id: 'p-demon1', name: 'Max Mazanov', handle: 'Demon1', role: 'Duelist / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Demon1', country: 'US' }
    ]
  },
  {
    id: 'team-t1',
    name: 'T1 Apex',
    tag: 'T1',
    seed: 11,
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop',
    region: 'Pacific',
    captainId: 'p-xeta',
    captainName: 'xeta',
    color: '#E11D48',
    stats: { matchesWon: 1, matchesLost: 1, mapsWon: 2, mapsLost: 2 },
    roster: [
      { id: 'p-xeta', name: 'Son Seon-ho', handle: 'xeta', role: 'IGL / Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xeta', country: 'KR' },
      { id: 'p-sayaplayer', name: 'Ha Jung-woo', handle: 'Sayaplayer', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sayaplayer', country: 'KR' },
      { id: 'p-rossy', name: 'Daniel Abedrabbo', handle: 'Rossy', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rossy', country: 'US' },
      { id: 'p-carpe', name: 'Lee Jae-hyeok', handle: 'Carpe', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Carpe', country: 'KR' },
      { id: 'p-stew', name: 'Ham Woo-joo', handle: 'stew', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=stew', country: 'KR' }
    ]
  },
  {
    id: 'team-loud',
    name: 'LOUD Esports',
    tag: 'LOUD',
    seed: 12,
    logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&h=100&fit=crop',
    region: 'Americas',
    captainId: 'p-saadhak',
    captainName: 'Saadhak',
    color: '#10B981',
    stats: { matchesWon: 1, matchesLost: 1, mapsWon: 3, mapsLost: 3 },
    roster: [
      { id: 'p-saadhak', name: 'Matias Delipetro', handle: 'Saadhak', role: 'IGL / Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Saadhak', country: 'AR' },
      { id: 'p-less', name: 'Felipe Basso', handle: 'Less', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Less', country: 'BR' },
      { id: 'p-tuyz', name: 'Arthur Vieira', handle: 'tuyz', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=tuyz', country: 'BR' },
      { id: 'p-cauanzin', name: 'Cauan Pereira', handle: 'cauanzin', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cauanzin', country: 'BR' },
      { id: 'p-qck', name: 'Gabriel Lima', handle: 'qck', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=qck', country: 'BR' }
    ]
  },
  {
    id: 'team-vit',
    name: 'Team Vitality',
    tag: 'VIT',
    seed: 13,
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-cender',
    captainName: 'ceNder',
    color: '#FACC15',
    stats: { matchesWon: 0, matchesLost: 1, mapsWon: 1, mapsLost: 2 },
    roster: [
      { id: 'p-cender', name: 'Jokūbas Labutis', handle: 'ceNder', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ceNder', country: 'LT' },
      { id: 'p-sayf', name: 'Saif Jibraeel', handle: 'Sayf', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sayf', country: 'SE' },
      { id: 'p-trexx', name: 'Nikita Cherednichenko', handle: 'trexx', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=trexx', country: 'RU' },
      { id: 'p-kicks', name: 'Kimmie Laasner', handle: 'Kicks', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kicks', country: 'EE' },
      { id: 'p-runneR', name: 'Emil Trajkovski', handle: 'runneR', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=runneR', country: 'MK' }
    ]
  },
  {
    id: 'team-navi',
    name: 'Natus Vincere',
    tag: 'NAVI',
    seed: 14,
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-ange1',
    captainName: 'ANGE1',
    color: '#EAB308',
    stats: { matchesWon: 0, matchesLost: 1, mapsWon: 0, mapsLost: 2 },
    roster: [
      { id: 'p-ange1', name: 'Kyrylo Karasov', handle: 'ANGE1', role: 'IGL / Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ANGE1', country: 'UA' },
      { id: 'p-shao', name: 'Andrey Kiprsky', handle: 'Shao', role: 'Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shao', country: 'RU' },
      { id: 'p-zyppan', name: 'Pontus Eek', handle: 'Zyppan', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zyppan', country: 'SE' },
      { id: 'p-suygetsu', name: 'Dmitry Ilyushin', handle: 'SUYGETSU', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SUYGETSU', country: 'RU' },
      { id: 'p-ardiis', name: 'Ardis Svarenieks', handle: 'ardiis', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ardiis', country: 'LV' }
    ]
  },
  {
    id: 'team-kc',
    name: 'Karmine Corp',
    tag: 'KC',
    seed: 15,
    logo: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-shin',
    captainName: 'Shin',
    color: '#3B82F6',
    stats: { matchesWon: 0, matchesLost: 1, mapsWon: 1, mapsLost: 2 },
    roster: [
      { id: 'p-shin', name: 'Ryad Ensaad', handle: 'Shin', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shin', country: 'FR' },
      { id: 'p-magnum', name: 'Martin Peňkov', handle: 'Magnum', role: 'IGL / Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Magnum', country: 'CZ' },
      { id: 'p-marteen', name: 'Martin Pátek', handle: 'marteen', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=marteen', country: 'CZ' },
      { id: 'p-tomaszy', name: 'Tomás Machado', handle: 'tomaszy', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=tomaszy', country: 'PT' },
      { id: 'p-engahh', name: 'Hazem Abdalla', handle: 'engahh', role: 'Controller', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=engahh', country: 'EG' }
    ]
  },
  {
    id: 'team-fut',
    name: 'FUT Esports',
    tag: 'FUT',
    seed: 16,
    logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&h=100&fit=crop',
    region: 'EMEA',
    captainId: 'p-mrfalin',
    captainName: 'MrFaliN',
    color: '#EF4444',
    stats: { matchesWon: 0, matchesLost: 1, mapsWon: 0, mapsLost: 2 },
    roster: [
      { id: 'p-mrfalin', name: 'Furkan Yeğen', handle: 'MrFaliN', role: 'IGL / Initiator', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MrFaliN', country: 'TR' },
      { id: 'p-qraxs', name: 'Doğukan Balaban', handle: 'qRaxs', role: 'Flex', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=qRaxs', country: 'TR' },
      { id: 'p-ata', name: 'Ata Kaban', handle: 'ATA KAN', role: 'Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ATAKAN', country: 'TR' },
      { id: 'p-yetujey', name: 'Eray Budak', handle: 'yetujey', role: 'Sentinel', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=yetujey', country: 'TR' },
      { id: 'p-cned', name: 'Mehmet Yağız İpek', handle: 'cNed', role: 'Sniper / Duelist', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cNed', country: 'TR' }
    ]
  }
];

export function createInitialBracketNodes(teams: TeamEntity[]): BracketNode[] {
  const getTeam = (id: string) => teams.find(t => t.id === id) || null;

  return [
    // -------------------------------------------------------------------------
    // UPPER BRACKET ROUND 1 (8 Matches) - Stage 0
    // -------------------------------------------------------------------------
    {
      id: 'm-ub-r1-1',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T12:00:00Z',
      estimatedStartTimeUtc: '2026-10-17T12:00:00Z',
      team1: { team: getTeam('team-sen'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-fut'), score: 0, isReportedWinner: false },
      winnerId: 'team-sen',
      nextMatchId: 'm-ub-qf-1',
      loserMatchId: 'm-lb-r1-1',
      maps: [
        { mapNumber: 1, mapName: 'Lotus', score1: 13, score2: 7, status: 'COMPLETED', pickedBy: 'team-sen' },
        { mapNumber: 2, mapName: 'Sunset', score1: 13, score2: 5, status: 'COMPLETED', pickedBy: 'team-fut' }
      ],
      streamUrl: 'https://twitch.tv/valorant',
      captainReports: {
        team1Report: {
          captainId: 'p-tenz',
          captainName: 'TenZ',
          teamId: 'team-sen',
          reportedWinnerId: 'team-sen',
          reportedScore1: 2,
          reportedScore2: 0,
          reportedAtUtc: '2026-10-17T13:45:00Z'
        },
        team2Report: {
          captainId: 'p-mrfalin',
          captainName: 'MrFaliN',
          teamId: 'team-fut',
          reportedWinnerId: 'team-sen',
          reportedScore1: 2,
          reportedScore2: 0,
          reportedAtUtc: '2026-10-17T13:46:00Z'
        }
      }
    },
    {
      id: 'm-ub-r1-2',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T12:00:00Z',
      estimatedStartTimeUtc: '2026-10-17T12:00:00Z',
      team1: { team: getTeam('team-c9'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-blg'), score: 1, isReportedWinner: false },
      winnerId: 'team-c9',
      nextMatchId: 'm-ub-qf-1',
      loserMatchId: 'm-lb-r1-1',
      maps: [
        { mapNumber: 1, mapName: 'Ascent', score1: 13, score2: 9, status: 'COMPLETED', pickedBy: 'team-c9' },
        { mapNumber: 2, mapName: 'Haven', score1: 10, score2: 13, status: 'COMPLETED', pickedBy: 'team-blg' },
        { mapNumber: 3, mapName: 'Bind', score1: 13, score2: 11, status: 'COMPLETED' }
      ],
      streamUrl: 'https://twitch.tv/valorant_b'
    },
    {
      id: 'm-ub-r1-3',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 2,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T14:30:00Z',
      estimatedStartTimeUtc: '2026-10-17T14:30:00Z',
      team1: { team: getTeam('team-gen'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-vit'), score: 1, isReportedWinner: false },
      winnerId: 'team-gen',
      nextMatchId: 'm-ub-qf-2',
      loserMatchId: 'm-lb-r1-2',
      maps: [
        { mapNumber: 1, mapName: 'Abyss', score1: 13, score2: 8, status: 'COMPLETED', pickedBy: 'team-gen' },
        { mapNumber: 2, mapName: 'Icebox', score1: 11, score2: 13, status: 'COMPLETED', pickedBy: 'team-vit' },
        { mapNumber: 3, mapName: 'Split', score1: 13, score2: 6, status: 'COMPLETED' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-r1-4',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 3,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T14:30:00Z',
      estimatedStartTimeUtc: '2026-10-17T14:30:00Z',
      team1: { team: getTeam('team-tl'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-loud'), score: 0, isReportedWinner: false },
      winnerId: 'team-tl',
      nextMatchId: 'm-ub-qf-2',
      loserMatchId: 'm-lb-r1-2',
      maps: [
        { mapNumber: 1, mapName: 'Haven', score1: 13, score2: 10, status: 'COMPLETED', pickedBy: 'team-loud' },
        { mapNumber: 2, mapName: 'Ascent', score1: 14, score2: 12, status: 'COMPLETED', pickedBy: 'team-tl' }
      ],
      streamUrl: 'https://twitch.tv/valorant_b'
    },
    {
      id: 'm-ub-r1-5',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 4,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T17:00:00Z',
      estimatedStartTimeUtc: '2026-10-17T17:00:00Z',
      team1: { team: getTeam('team-prx'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-kc'), score: 1, isReportedWinner: false },
      winnerId: 'team-prx',
      nextMatchId: 'm-ub-qf-3',
      loserMatchId: 'm-lb-r1-3',
      maps: [
        { mapNumber: 1, mapName: 'Sunset', score1: 13, score2: 11, status: 'COMPLETED', pickedBy: 'team-prx' },
        { mapNumber: 2, mapName: 'Lotus', score1: 9, score2: 13, status: 'COMPLETED', pickedBy: 'team-kc' },
        { mapNumber: 3, mapName: 'Bind', score1: 13, score2: 8, status: 'COMPLETED' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-r1-6',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 5,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T17:00:00Z',
      estimatedStartTimeUtc: '2026-10-17T17:00:00Z',
      team1: { team: getTeam('team-edg'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-nrg'), score: 0, isReportedWinner: false },
      winnerId: 'team-edg',
      nextMatchId: 'm-ub-qf-3',
      loserMatchId: 'm-lb-r1-3',
      maps: [
        { mapNumber: 1, mapName: 'Abyss', score1: 13, score2: 5, status: 'COMPLETED', pickedBy: 'team-edg' },
        { mapNumber: 2, mapName: 'Haven', score1: 13, score2: 9, status: 'COMPLETED', pickedBy: 'team-nrg' }
      ],
      streamUrl: 'https://twitch.tv/valorant_b'
    },
    {
      id: 'm-ub-r1-7',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 6,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T19:30:00Z',
      estimatedStartTimeUtc: '2026-10-17T19:30:00Z',
      team1: { team: getTeam('team-fnc'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-navi'), score: 0, isReportedWinner: false },
      winnerId: 'team-fnc',
      nextMatchId: 'm-ub-qf-4',
      loserMatchId: 'm-lb-r1-4',
      maps: [
        { mapNumber: 1, mapName: 'Icebox', score1: 13, score2: 7, status: 'COMPLETED', pickedBy: 'team-fnc' },
        { mapNumber: 2, mapName: 'Lotus', score1: 13, score2: 10, status: 'COMPLETED', pickedBy: 'team-navi' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-r1-8',
      stageName: 'Upper Round 1',
      roundIndex: 0,
      matchIndex: 7,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-17T19:30:00Z',
      estimatedStartTimeUtc: '2026-10-17T19:30:00Z',
      team1: { team: getTeam('team-drx'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-t1'), score: 1, isReportedWinner: false },
      winnerId: 'team-drx',
      nextMatchId: 'm-ub-qf-4',
      loserMatchId: 'm-lb-r1-4',
      maps: [
        { mapNumber: 1, mapName: 'Ascent', score1: 11, score2: 13, status: 'COMPLETED', pickedBy: 'team-drx' },
        { mapNumber: 2, mapName: 'Split', score1: 13, score2: 8, status: 'COMPLETED', pickedBy: 'team-t1' },
        { mapNumber: 3, mapName: 'Sunset', score1: 13, score2: 9, status: 'COMPLETED' }
      ],
      streamUrl: 'https://twitch.tv/valorant_b'
    },

    // -------------------------------------------------------------------------
    // UPPER BRACKET QUARTERFINALS (4 Matches) - Stage 1
    // -------------------------------------------------------------------------
    {
      id: 'm-ub-qf-1',
      stageName: 'Upper Quarterfinal',
      roundIndex: 1,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'COMPLETED',
      scheduledTimeUtc: '2026-10-18T12:00:00Z',
      estimatedStartTimeUtc: '2026-10-18T12:00:00Z',
      team1: { team: getTeam('team-sen'), score: 2, isReportedWinner: true },
      team2: { team: getTeam('team-c9'), score: 0, isReportedWinner: false },
      winnerId: 'team-sen',
      nextMatchId: 'm-ub-sf-1',
      loserMatchId: 'm-lb-r2-1',
      maps: [
        { mapNumber: 1, mapName: 'Sunset', score1: 13, score2: 6, status: 'COMPLETED', pickedBy: 'team-sen' },
        { mapNumber: 2, mapName: 'Lotus', score1: 13, score2: 9, status: 'COMPLETED', pickedBy: 'team-c9' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-qf-2',
      stageName: 'Upper Quarterfinal',
      roundIndex: 1,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'LIVE', // Currently LIVE match!
      scheduledTimeUtc: '2026-10-18T15:00:00Z',
      estimatedStartTimeUtc: '2026-10-18T15:00:00Z',
      team1: { team: getTeam('team-gen'), score: 1, isReportedWinner: false },
      team2: { team: getTeam('team-tl'), score: 1, isReportedWinner: false },
      winnerId: undefined,
      nextMatchId: 'm-ub-sf-1',
      loserMatchId: 'm-lb-r2-2',
      maps: [
        { mapNumber: 1, mapName: 'Abyss', score1: 13, score2: 9, status: 'COMPLETED', pickedBy: 'team-gen' },
        { mapNumber: 2, mapName: 'Ascent', score1: 10, score2: 13, status: 'COMPLETED', pickedBy: 'team-tl' },
        { mapNumber: 3, mapName: 'Haven', score1: 11, score2: 10, status: 'IN_PROGRESS', currentRound: 22 }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-qf-3',
      stageName: 'Upper Quarterfinal',
      roundIndex: 1,
      matchIndex: 2,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'LIVE', // Another thrilling LIVE match!
      scheduledTimeUtc: '2026-10-18T18:00:00Z',
      estimatedStartTimeUtc: '2026-10-18T18:00:00Z',
      team1: { team: getTeam('team-prx'), score: 1, isReportedWinner: false },
      team2: { team: getTeam('team-edg'), score: 0, isReportedWinner: false },
      winnerId: undefined,
      nextMatchId: 'm-ub-sf-2',
      loserMatchId: 'm-lb-r2-3',
      maps: [
        { mapNumber: 1, mapName: 'Sunset', score1: 14, score2: 12, status: 'COMPLETED', pickedBy: 'team-prx' },
        { mapNumber: 2, mapName: 'Bind', score1: 8, score2: 9, status: 'IN_PROGRESS', currentRound: 18 }
      ],
      streamUrl: 'https://twitch.tv/valorant_b'
    },
    {
      id: 'm-ub-qf-4',
      stageName: 'Upper Quarterfinal',
      roundIndex: 1,
      matchIndex: 3,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'READY',
      scheduledTimeUtc: '2026-10-18T21:00:00Z',
      estimatedStartTimeUtc: '2026-10-18T21:00:00Z',
      team1: { team: getTeam('team-fnc'), score: 0 },
      team2: { team: getTeam('team-drx'), score: 0 },
      winnerId: undefined,
      nextMatchId: 'm-ub-sf-2',
      loserMatchId: 'm-lb-r2-4',
      maps: [
        { mapNumber: 1, mapName: 'Lotus', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Ascent', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 3, mapName: 'Abyss', score1: 0, score2: 0, status: 'UPCOMING' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },

    // -------------------------------------------------------------------------
    // UPPER BRACKET SEMIFINALS (2 Matches) - Stage 2
    // -------------------------------------------------------------------------
    {
      id: 'm-ub-sf-1',
      stageName: 'Upper Semifinal',
      roundIndex: 2,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T14:00:00Z',
      team1: { team: getTeam('team-sen'), score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-ub-final',
      loserMatchId: 'm-lb-qf-1',
      maps: [
        { mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },
    {
      id: 'm-ub-sf-2',
      stageName: 'Upper Semifinal',
      roundIndex: 2,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T17:30:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-ub-final',
      loserMatchId: 'm-lb-qf-2',
      maps: [
        { mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },

    // -------------------------------------------------------------------------
    // UPPER BRACKET FINAL (1 Match) - Stage 3
    // -------------------------------------------------------------------------
    {
      id: 'm-ub-final',
      stageName: 'Upper Final',
      roundIndex: 3,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'UPPER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-20T16:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-gf',
      loserMatchId: 'm-lb-final',
      maps: [
        { mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 3, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    },

    // -------------------------------------------------------------------------
    // LOWER BRACKET ROUND 1 (4 Matches) - Stage 0
    // -------------------------------------------------------------------------
    {
      id: 'm-lb-r1-1',
      stageName: 'Lower Round 1',
      roundIndex: 0,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'READY',
      scheduledTimeUtc: '2026-10-18T10:00:00Z',
      team1: { team: getTeam('team-fut'), score: 0 },
      team2: { team: getTeam('team-blg'), score: 0 },
      nextMatchId: 'm-lb-r2-1',
      maps: [
        { mapNumber: 1, mapName: 'Lotus', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Bind', score1: 0, score2: 0, status: 'UPCOMING' }
      ]
    },
    {
      id: 'm-lb-r1-2',
      stageName: 'Lower Round 1',
      roundIndex: 0,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-18T13:00:00Z',
      team1: { team: getTeam('team-vit'), score: 0 },
      team2: { team: getTeam('team-loud'), score: 0 },
      nextMatchId: 'm-lb-r2-2',
      maps: [
        { mapNumber: 1, mapName: 'Abyss', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Sunset', score1: 0, score2: 0, status: 'UPCOMING' }
      ]
    },
    {
      id: 'm-lb-r1-3',
      stageName: 'Lower Round 1',
      roundIndex: 0,
      matchIndex: 2,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-18T16:00:00Z',
      team1: { team: getTeam('team-kc'), score: 0 },
      team2: { team: getTeam('team-nrg'), score: 0 },
      nextMatchId: 'm-lb-r2-3',
      maps: [
        { mapNumber: 1, mapName: 'Split', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Icebox', score1: 0, score2: 0, status: 'UPCOMING' }
      ]
    },
    {
      id: 'm-lb-r1-4',
      stageName: 'Lower Round 1',
      roundIndex: 0,
      matchIndex: 3,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-18T19:00:00Z',
      team1: { team: getTeam('team-navi'), score: 0 },
      team2: { team: getTeam('team-t1'), score: 0 },
      nextMatchId: 'm-lb-r2-4',
      maps: [
        { mapNumber: 1, mapName: 'Ascent', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Haven', score1: 0, score2: 0, status: 'UPCOMING' }
      ]
    },

    // -------------------------------------------------------------------------
    // LOWER BRACKET ROUND 2 (4 Matches) - Stage 1
    // -------------------------------------------------------------------------
    {
      id: 'm-lb-r2-1',
      stageName: 'Lower Round 2',
      roundIndex: 1,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T10:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-qf-1',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },
    {
      id: 'm-lb-r2-2',
      stageName: 'Lower Round 2',
      roundIndex: 1,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T13:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-qf-1',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },
    {
      id: 'm-lb-r2-3',
      stageName: 'Lower Round 2',
      roundIndex: 1,
      matchIndex: 2,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T16:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-qf-2',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },
    {
      id: 'm-lb-r2-4',
      stageName: 'Lower Round 2',
      roundIndex: 1,
      matchIndex: 3,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-19T19:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-qf-2',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },

    // -------------------------------------------------------------------------
    // LOWER BRACKET QUARTERFINALS (2 Matches) - Stage 2
    // -------------------------------------------------------------------------
    {
      id: 'm-lb-qf-1',
      stageName: 'Lower Quarterfinal',
      roundIndex: 2,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-20T12:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-sf',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },
    {
      id: 'm-lb-qf-2',
      stageName: 'Lower Quarterfinal',
      roundIndex: 2,
      matchIndex: 1,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-20T15:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-sf',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },

    // -------------------------------------------------------------------------
    // LOWER BRACKET SEMIFINAL (1 Match) - Stage 3
    // -------------------------------------------------------------------------
    {
      id: 'm-lb-sf',
      stageName: 'Lower Semifinal',
      roundIndex: 3,
      matchIndex: 0,
      bestOf: 3,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-21T14:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-lb-final',
      maps: [{ mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }]
    },

    // -------------------------------------------------------------------------
    // LOWER BRACKET FINAL (1 Match) - Stage 4
    // -------------------------------------------------------------------------
    {
      id: 'm-lb-final',
      stageName: 'Lower Final',
      roundIndex: 4,
      matchIndex: 0,
      bestOf: 5,
      bracketType: 'LOWER',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-22T14:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      nextMatchId: 'm-gf',
      maps: [
        { mapNumber: 1, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 3, mapName: 'TBD', score1: 0, score2: 0, status: 'UPCOMING' }
      ]
    },

    // -------------------------------------------------------------------------
    // GRAND FINAL (1 Match) - Best of 5
    // -------------------------------------------------------------------------
    {
      id: 'm-gf',
      stageName: 'Grand Final',
      roundIndex: 5,
      matchIndex: 0,
      bestOf: 5,
      bracketType: 'GRAND_FINAL',
      status: 'SCHEDULED',
      scheduledTimeUtc: '2026-10-23T16:00:00Z',
      estimatedStartTimeUtc: '2026-10-23T16:00:00Z',
      team1: { team: null, score: 0 },
      team2: { team: null, score: 0 },
      maps: [
        { mapNumber: 1, mapName: 'Haven', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 2, mapName: 'Ascent', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 3, mapName: 'Sunset', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 4, mapName: 'Abyss', score1: 0, score2: 0, status: 'UPCOMING' },
        { mapNumber: 5, mapName: 'Lotus', score1: 0, score2: 0, status: 'UPCOMING' }
      ],
      streamUrl: 'https://twitch.tv/valorant'
    }
  ];
}

export function createInitialTournamentState(): TournamentState {
  const teams = [...TEAMS];
  const bracketNodes = createInitialBracketNodes(teams);
  const activeLiveMatches = bracketNodes.filter(n => n.status === 'LIVE').map(n => n.id);

  return {
    tournamentId: 'tourney-vct-tokyo-2026',
    title: 'VALORANT CHAMPIONS TOUR // TOKYO MASTERS',
    gameTitle: 'VALORANT (Tier-1 Global Major)',
    format: 'DOUBLE_ELIMINATION',
    prizePool: '$1,000,000 USD',
    currentStage: 'Upper Quarterfinals & Lower R1',
    teams,
    bracketNodes,
    activeLiveMatches
  };
}
