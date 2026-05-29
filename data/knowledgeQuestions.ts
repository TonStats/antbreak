import type { KnowledgeQuestion, KnowledgeCategory, KnowledgeDifficulty } from '../types/knowledge'

// ─── Science & Nature (20: 7 easy, 7 medium, 6 hard) ──────────────────────────

const SCIENCE: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'sc1', category: 'science', difficulty: 'easy',
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'O2', 'H2'],
    correctAnswer: 'H2O',
    explanation: 'Water is made of 2 hydrogen atoms bonded to 1 oxygen atom.',
  },
  {
    id: 'sc2', category: 'science', difficulty: 'easy',
    question: 'How many planets are in our solar system?',
    options: ['7', '8', '9', '10'],
    correctAnswer: '8',
    explanation: 'Pluto was reclassified as a dwarf planet in 2006, leaving 8 planets.',
  },
  {
    id: 'sc3', category: 'science', difficulty: 'easy',
    question: 'What gas do plants absorb from the air during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correctAnswer: 'Carbon Dioxide',
    explanation: 'Plants absorb CO₂ during photosynthesis and release oxygen as a by-product.',
  },
  {
    id: 'sc4', category: 'science', difficulty: 'easy',
    question: 'What is the largest planet in our solar system?',
    options: ['Mars', 'Saturn', 'Neptune', 'Jupiter'],
    correctAnswer: 'Jupiter',
    explanation: 'Jupiter is the largest planet, with a mass greater than all other planets combined.',
  },
  {
    id: 'sc5', category: 'science', difficulty: 'easy',
    question: 'What is the boiling point of water at sea level?',
    options: ['80°C', '90°C', '100°C', '120°C'],
    correctAnswer: '100°C',
    explanation: 'Water boils at exactly 100°C (212°F) at standard atmospheric pressure.',
  },
  {
    id: 'sc6', category: 'science', difficulty: 'easy',
    question: 'How many legs does a spider have?',
    options: ['4', '6', '8', '10'],
    correctAnswer: '8',
    explanation: 'Spiders are arachnids and have 8 legs, unlike insects which have 6.',
  },
  {
    id: 'sc7', category: 'science', difficulty: 'easy',
    question: 'What is the hardest natural substance on Earth?',
    options: ['Gold', 'Iron', 'Quartz', 'Diamond'],
    correctAnswer: 'Diamond',
    explanation: 'Diamond scores 10 on the Mohs hardness scale — the maximum possible.',
  },
  // Medium
  {
    id: 'sc8', category: 'science', difficulty: 'medium',
    question: 'What is the speed of light in a vacuum?',
    options: ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1,000,000 km/s'],
    correctAnswer: '300,000 km/s',
    explanation: 'Light travels at approximately 299,792 km/s in a vacuum.',
  },
  {
    id: 'sc9', category: 'science', difficulty: 'medium',
    question: 'What element has the chemical symbol Fe?',
    options: ['Gold', 'Silver', 'Iron', 'Copper'],
    correctAnswer: 'Iron',
    explanation: 'Fe comes from the Latin word "ferrum", meaning iron.',
  },
  {
    id: 'sc10', category: 'science', difficulty: 'medium',
    question: 'What is known as the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Golgi Body', 'Mitochondria'],
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria produce ATP through cellular respiration, supplying energy to the cell.',
  },
  {
    id: 'sc11', category: 'science', difficulty: 'medium',
    question: 'What is the most abundant element in the human body by mass?',
    options: ['Carbon', 'Hydrogen', 'Nitrogen', 'Oxygen'],
    correctAnswer: 'Oxygen',
    explanation: 'Oxygen makes up about 65% of the human body by mass, mostly found in water.',
  },
  {
    id: 'sc12', category: 'science', difficulty: 'medium',
    question: 'How many chromosomes does a typical human cell contain?',
    options: ['23', '36', '46', '48'],
    correctAnswer: '46',
    explanation: 'Humans have 46 chromosomes arranged in 23 pairs in each somatic cell.',
  },
  {
    id: 'sc13', category: 'science', difficulty: 'medium',
    question: 'What is the chemical symbol for gold?',
    options: ['Gd', 'Go', 'Ag', 'Au'],
    correctAnswer: 'Au',
    explanation: 'Au comes from the Latin word "aurum", meaning gold.',
  },
  {
    id: 'sc14', category: 'science', difficulty: 'medium',
    question: 'What is the name of the process by which a cell divides into two identical cells?',
    options: ['Meiosis', 'Osmosis', 'Mitosis', 'Diffusion'],
    correctAnswer: 'Mitosis',
    explanation: 'Mitosis produces two genetically identical daughter cells and is used for growth and repair.',
  },
  // Hard
  {
    id: 'sc15', category: 'science', difficulty: 'hard',
    question: 'What is the half-life of Carbon-14?',
    options: ['1,000 years', '5,730 years', '10,000 years', '50,000 years'],
    correctAnswer: '5,730 years',
    explanation: 'C-14 has a half-life of 5,730 years, making it useful for radiocarbon dating of organic material.',
  },
  {
    id: 'sc16', category: 'science', difficulty: 'hard',
    question: 'What is the boiling point of liquid nitrogen at atmospheric pressure?',
    options: ['-100°C', '-150°C', '-196°C', '-273°C'],
    correctAnswer: '-196°C',
    explanation: 'Liquid nitrogen boils at −195.79°C (77 K) at atmospheric pressure.',
  },
  {
    id: 'sc17', category: 'science', difficulty: 'hard',
    question: 'What is the chemical formula for ammonia?',
    options: ['N2H4', 'N2O', 'CH4', 'NH3'],
    correctAnswer: 'NH3',
    explanation: 'Ammonia consists of one nitrogen atom bonded to three hydrogen atoms.',
  },
  {
    id: 'sc18', category: 'science', difficulty: 'hard',
    question: 'Who proposed the quantum model of the atom with discrete energy levels?',
    options: ['Albert Einstein', 'Niels Bohr', 'Erwin Schrödinger', 'Werner Heisenberg'],
    correctAnswer: 'Niels Bohr',
    explanation: 'Niels Bohr proposed his atomic model in 1913 with electrons in fixed quantised orbits.',
  },
  {
    id: 'sc19', category: 'science', difficulty: 'hard',
    question: 'What is the term for a substance that speeds up a chemical reaction without being consumed?',
    options: ['Reagent', 'Solvent', 'Precipitate', 'Catalyst'],
    correctAnswer: 'Catalyst',
    explanation: 'A catalyst lowers the activation energy of a reaction and is not used up in the process.',
  },
  {
    id: 'sc20', category: 'science', difficulty: 'hard',
    question: 'What phenomenon describes light bending around a massive gravitational object?',
    options: ['Diffraction', 'Refraction', 'Total Internal Reflection', 'Gravitational Lensing'],
    correctAnswer: 'Gravitational Lensing',
    explanation: 'Gravitational lensing occurs when a massive object curves spacetime, bending light passing nearby — confirmed by Eddington in 1919.',
  },
]

// ─── History & World Events (20: 7 easy, 7 medium, 6 hard) ───────────────────

const HISTORY: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'hi1', category: 'history', difficulty: 'easy',
    question: 'In what year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: '1945',
    explanation: 'WWII ended in 1945 — Germany surrendered in May and Japan in September.',
  },
  {
    id: 'hi2', category: 'history', difficulty: 'easy',
    question: 'Who was the first person to walk on the moon?',
    options: ['Buzz Aldrin', 'Yuri Gagarin', 'John Glenn', 'Neil Armstrong'],
    correctAnswer: 'Neil Armstrong',
    explanation: 'Neil Armstrong took the first steps on the moon on July 20, 1969, during Apollo 11.',
  },
  {
    id: 'hi3', category: 'history', difficulty: 'easy',
    question: 'Who was the first President of the United States?',
    options: ['John Adams', 'Thomas Jefferson', 'Benjamin Franklin', 'George Washington'],
    correctAnswer: 'George Washington',
    explanation: 'George Washington served as the first US president from 1789 to 1797.',
  },
  {
    id: 'hi4', category: 'history', difficulty: 'easy',
    question: 'In which country is the Eiffel Tower located?',
    options: ['Italy', 'Spain', 'UK', 'France'],
    correctAnswer: 'France',
    explanation: 'The Eiffel Tower is in Paris, France, built for the 1889 World\'s Fair.',
  },
  {
    id: 'hi5', category: 'history', difficulty: 'easy',
    question: 'Who was the first woman to win a Nobel Prize?',
    options: ['Florence Nightingale', 'Ada Lovelace', 'Rosalind Franklin', 'Marie Curie'],
    correctAnswer: 'Marie Curie',
    explanation: 'Marie Curie won the Nobel Prize in Physics in 1903 and Chemistry in 1911.',
  },
  {
    id: 'hi6', category: 'history', difficulty: 'easy',
    question: 'What was the name of the first artificial satellite launched into space?',
    options: ['Explorer 1', 'Vostok 1', 'Apollo 1', 'Sputnik 1'],
    correctAnswer: 'Sputnik 1',
    explanation: 'Sputnik 1 was launched by the Soviet Union on October 4, 1957.',
  },
  {
    id: 'hi7', category: 'history', difficulty: 'easy',
    question: 'In what year did Christopher Columbus reach the Americas?',
    options: ['1488', '1492', '1498', '1504'],
    correctAnswer: '1492',
    explanation: 'Columbus landed in the Bahamas on October 12, 1492, opening sustained contact between Europe and the Americas.',
  },
  // Medium
  {
    id: 'hi8', category: 'history', difficulty: 'medium',
    question: 'The Berlin Wall fell in which year?',
    options: ['1987', '1988', '1989', '1990'],
    correctAnswer: '1989',
    explanation: 'The Berlin Wall fell on November 9, 1989, marking a pivotal moment in the end of the Cold War.',
  },
  {
    id: 'hi9', category: 'history', difficulty: 'medium',
    question: 'The Aztec Empire was conquered by which European explorer?',
    options: ['Francisco Pizarro', 'Vasco da Gama', 'Ferdinand Magellan', 'Hernán Cortés'],
    correctAnswer: 'Hernán Cortés',
    explanation: 'Hernán Cortés conquered the Aztec Empire between 1519 and 1521 on behalf of Spain.',
  },
  {
    id: 'hi10', category: 'history', difficulty: 'medium',
    question: 'In what year did the French Revolution begin?',
    options: ['1776', '1789', '1799', '1804'],
    correctAnswer: '1789',
    explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.',
  },
  {
    id: 'hi11', category: 'history', difficulty: 'medium',
    question: 'Who was the first female Prime Minister of the United Kingdom?',
    options: ['Theresa May', 'Angela Merkel', 'Indira Gandhi', 'Margaret Thatcher'],
    correctAnswer: 'Margaret Thatcher',
    explanation: 'Margaret Thatcher became the UK\'s first female PM in 1979, serving until 1990.',
  },
  {
    id: 'hi12', category: 'history', difficulty: 'medium',
    question: 'What was the name of the ship that sank on its maiden voyage in 1912?',
    options: ['Lusitania', 'Britannic', 'Olympic', 'Titanic'],
    correctAnswer: 'Titanic',
    explanation: 'RMS Titanic sank on April 15, 1912, after striking an iceberg on its first transatlantic voyage.',
  },
  {
    id: 'hi13', category: 'history', difficulty: 'medium',
    question: 'Which country won the Battle of Stalingrad during World War II?',
    options: ['Germany', 'United States', 'United Kingdom', 'Soviet Union'],
    correctAnswer: 'Soviet Union',
    explanation: 'The Soviet Union\'s victory at Stalingrad (1942–43) was a turning point on the Eastern Front.',
  },
  {
    id: 'hi14', category: 'history', difficulty: 'medium',
    question: 'Which empire was ruled by Genghis Khan?',
    options: ['Ottoman Empire', 'Roman Empire', 'Persian Empire', 'Mongol Empire'],
    correctAnswer: 'Mongol Empire',
    explanation: 'Genghis Khan founded the Mongol Empire in 1206, which became the largest contiguous land empire in history.',
  },
  // Hard
  {
    id: 'hi15', category: 'history', difficulty: 'hard',
    question: 'Which treaty formally ended the First World War?',
    options: ['Treaty of Paris', 'Treaty of Westphalia', 'Treaty of Vienna', 'Treaty of Versailles'],
    correctAnswer: 'Treaty of Versailles',
    explanation: 'The Treaty of Versailles was signed on June 28, 1919, formally ending WWI and holding Germany responsible.',
  },
  {
    id: 'hi16', category: 'history', difficulty: 'hard',
    question: 'Who was the last emperor of the Byzantine Empire?',
    options: ['Justinian I', 'Basil II', 'Heraclius', 'Constantine XI'],
    correctAnswer: 'Constantine XI',
    explanation: 'Constantine XI Palaiologos was the last Byzantine emperor, dying in 1453 during the Ottoman conquest of Constantinople.',
  },
  {
    id: 'hi17', category: 'history', difficulty: 'hard',
    question: 'In what year was the Magna Carta signed?',
    options: ['1066', '1215', '1305', '1415'],
    correctAnswer: '1215',
    explanation: 'King John of England signed the Magna Carta on June 15, 1215, limiting royal power and establishing rule of law.',
  },
  {
    id: 'hi18', category: 'history', difficulty: 'hard',
    question: 'Which ancient wonder of the world stood in the harbour of Alexandria?',
    options: ['Temple of Artemis', 'Colossus of Rhodes', 'Library of Alexandria', 'Lighthouse of Alexandria'],
    correctAnswer: 'Lighthouse of Alexandria',
    explanation: 'The Lighthouse of Alexandria (Pharos) was one of the Seven Wonders of the Ancient World, standing about 100 metres tall.',
  },
  {
    id: 'hi19', category: 'history', difficulty: 'hard',
    question: 'Who was the first Roman Emperor?',
    options: ['Julius Caesar', 'Marcus Aurelius', 'Nero', 'Augustus'],
    correctAnswer: 'Augustus',
    explanation: 'Augustus (Octavian) became the first Roman Emperor in 27 BC after defeating Mark Antony and Cleopatra.',
  },
  {
    id: 'hi20', category: 'history', difficulty: 'hard',
    question: 'The Peloponnesian War was fought primarily between which two city-states?',
    options: ['Athens and Troy', 'Sparta and Persia', 'Corinth and Thebes', 'Athens and Sparta'],
    correctAnswer: 'Athens and Sparta',
    explanation: 'The Peloponnesian War (431–404 BC) was fought between the Athenian Empire and the Peloponnesian League led by Sparta.',
  },
]

// ─── Sports & Athletes (20: 7 easy, 7 medium, 6 hard) ────────────────────────

const SPORTS: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'sp1', category: 'sports', difficulty: 'easy',
    question: 'How many players are on a standard football (soccer) team?',
    options: ['9', '10', '11', '12'],
    correctAnswer: '11',
    explanation: 'A standard football team has 11 players including the goalkeeper.',
  },
  {
    id: 'sp2', category: 'sports', difficulty: 'easy',
    question: 'How many rings are on the Olympic flag?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    explanation: 'The 5 Olympic rings represent the 5 continents united by the Olympic movement.',
  },
  {
    id: 'sp3', category: 'sports', difficulty: 'easy',
    question: 'In which sport do you perform a slam dunk?',
    options: ['Volleyball', 'Soccer', 'Handball', 'Basketball'],
    correctAnswer: 'Basketball',
    explanation: 'A slam dunk is a shot in basketball where the player pushes the ball directly through the hoop.',
  },
  {
    id: 'sp4', category: 'sports', difficulty: 'easy',
    question: 'In golf, what is the term for completing a hole in one stroke under par?',
    options: ['Eagle', 'Par', 'Bogey', 'Birdie'],
    correctAnswer: 'Birdie',
    explanation: 'A birdie is one stroke under par. An eagle is two under, and an albatross is three under par.',
  },
  {
    id: 'sp5', category: 'sports', difficulty: 'easy',
    question: 'What sport is the Wimbledon tournament associated with?',
    options: ['Squash', 'Badminton', 'Racquetball', 'Tennis'],
    correctAnswer: 'Tennis',
    explanation: 'Wimbledon, held in London since 1877, is the oldest and most prestigious tennis Grand Slam.',
  },
  {
    id: 'sp6', category: 'sports', difficulty: 'easy',
    question: 'How many players from one team are on a basketball court at any time?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    explanation: 'Each basketball team fields 5 players on the court simultaneously.',
  },
  {
    id: 'sp7', category: 'sports', difficulty: 'easy',
    question: 'What colour is the home jersey of the Brazilian national football team?',
    options: ['Blue', 'White', 'Red', 'Yellow'],
    correctAnswer: 'Yellow',
    explanation: 'Brazil\'s iconic yellow jersey, paired with green shorts, is among the most recognised in world football.',
  },
  // Medium
  {
    id: 'sp8', category: 'sports', difficulty: 'medium',
    question: 'Who holds the record for most Grand Slam tennis singles titles?',
    options: ['Roger Federer', 'Rafael Nadal', 'Pete Sampras', 'Novak Djokovic'],
    correctAnswer: 'Novak Djokovic',
    explanation: 'Novak Djokovic holds the all-time record with 24 Grand Slam singles titles as of 2024.',
  },
  {
    id: 'sp9', category: 'sports', difficulty: 'medium',
    question: 'In what year were the first modern Olympic Games held?',
    options: ['1888', '1892', '1896', '1900'],
    correctAnswer: '1896',
    explanation: 'The first modern Olympics were held in Athens, Greece, in 1896, reviving the ancient tradition.',
  },
  {
    id: 'sp10', category: 'sports', difficulty: 'medium',
    question: 'Which country has won the most FIFA World Cups?',
    options: ['Germany', 'Argentina', 'Italy', 'Brazil'],
    correctAnswer: 'Brazil',
    explanation: 'Brazil has won the FIFA World Cup five times: 1958, 1962, 1970, 1994, and 2002.',
  },
  {
    id: 'sp11', category: 'sports', difficulty: 'medium',
    question: 'What is the maximum break (highest possible score in a single visit) in snooker?',
    options: ['100', '121', '147', '155'],
    correctAnswer: '147',
    explanation: 'A maximum break of 147 requires potting all 15 reds each followed by the black, then all the colours.',
  },
  {
    id: 'sp12', category: 'sports', difficulty: 'medium',
    question: 'Who holds the 100 metres world record as the fastest man in history?',
    options: ['Justin Gatlin', 'Tyson Gay', 'Asafa Powell', 'Usain Bolt'],
    correctAnswer: 'Usain Bolt',
    explanation: 'Usain Bolt set the 100m world record of 9.58 seconds at the 2009 World Championships in Berlin.',
  },
  {
    id: 'sp13', category: 'sports', difficulty: 'medium',
    question: 'In American football, how many points is a touchdown worth?',
    options: ['3', '6', '7', '8'],
    correctAnswer: '6',
    explanation: 'A touchdown is worth 6 points, with the option of a 1-point extra point or 2-point conversion afterward.',
  },
  {
    id: 'sp14', category: 'sports', difficulty: 'medium',
    question: 'How many players are in a rugby union team?',
    options: ['11', '13', '15', '17'],
    correctAnswer: '15',
    explanation: 'Rugby union is played with 15 players per side, compared to 13 in rugby league.',
  },
  // Hard
  {
    id: 'sp15', category: 'sports', difficulty: 'hard',
    question: 'Which country won the first ever FIFA World Cup in 1930?',
    options: ['Brazil', 'Argentina', 'Italy', 'Uruguay'],
    correctAnswer: 'Uruguay',
    explanation: 'Uruguay hosted and won the inaugural FIFA World Cup in 1930, beating Argentina 4–2 in the final.',
  },
  {
    id: 'sp16', category: 'sports', difficulty: 'hard',
    question: 'How many Grand Slam singles titles did Pete Sampras win during his career?',
    options: ['10', '12', '14', '16'],
    correctAnswer: '14',
    explanation: 'Pete Sampras won 14 Grand Slam titles between 1990 and 2002, a record that stood until Roger Federer surpassed it.',
  },
  {
    id: 'sp17', category: 'sports', difficulty: 'hard',
    question: 'Which athlete won four gold medals at the 1936 Berlin Olympics?',
    options: ['Jim Thorpe', 'Carl Lewis', 'Bob Beamon', 'Jesse Owens'],
    correctAnswer: 'Jesse Owens',
    explanation: 'Jesse Owens won gold in the 100m, 200m, long jump and 4×100m relay at the 1936 Berlin Games.',
  },
  {
    id: 'sp18', category: 'sports', difficulty: 'hard',
    question: 'What is the exact distance of a marathon race?',
    options: ['40 km', '41.5 km', '42.195 km', '42.5 km'],
    correctAnswer: '42.195 km',
    explanation: 'The marathon distance of 42.195 km (26.219 miles) was standardised at the 1908 London Olympics.',
  },
  {
    id: 'sp19', category: 'sports', difficulty: 'hard',
    question: 'In Formula 1 racing, how many championship points does the race winner receive?',
    options: ['10', '15', '20', '25'],
    correctAnswer: '25',
    explanation: 'The current F1 points system, introduced in 2010, awards 25 points to the race winner.',
  },
  {
    id: 'sp20', category: 'sports', difficulty: 'hard',
    question: 'Who holds the record for most goals scored in a single FIFA World Cup tournament?',
    options: ['Pelé', 'Ronaldo', 'Gerd Müller', 'Just Fontaine'],
    correctAnswer: 'Just Fontaine',
    explanation: 'Just Fontaine of France scored 13 goals at the 1958 World Cup in Sweden — a record that still stands.',
  },
]

// ─── Entertainment & Pop Culture (20: 7 easy, 7 medium, 6 hard) ──────────────

const ENTERTAINMENT: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'en1', category: 'entertainment', difficulty: 'easy',
    question: 'Iron Man is a superhero from which comic book publisher?',
    options: ['DC Comics', 'Dark Horse', 'Image Comics', 'Marvel'],
    correctAnswer: 'Marvel',
    explanation: 'Iron Man is a Marvel character who first appeared in Tales of Suspense #39 (1963) and in film in 2008.',
  },
  {
    id: 'en2', category: 'entertainment', difficulty: 'easy',
    question: 'How many books are in the main Harry Potter series?',
    options: ['5', '6', '7', '8'],
    correctAnswer: '7',
    explanation: 'J.K. Rowling wrote 7 Harry Potter novels, from The Philosopher\'s Stone (1997) to The Deathly Hallows (2007).',
  },
  {
    id: 'en3', category: 'entertainment', difficulty: 'easy',
    question: 'Who plays Tony Stark / Iron Man in the Marvel Cinematic Universe?',
    options: ['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'Robert Downey Jr.'],
    correctAnswer: 'Robert Downey Jr.',
    explanation: 'Robert Downey Jr. portrayed Tony Stark in 10 MCU films from 2008 to 2019.',
  },
  {
    id: 'en4', category: 'entertainment', difficulty: 'easy',
    question: 'Which animated film features the song "Let It Go"?',
    options: ['Tangled', 'Brave', 'Moana', 'Frozen'],
    correctAnswer: 'Frozen',
    explanation: '"Let It Go" was performed by Idina Menzel as Elsa in Disney\'s Frozen (2013).',
  },
  {
    id: 'en5', category: 'entertainment', difficulty: 'easy',
    question: 'Which legendary rock band included John Lennon as a member?',
    options: ['The Rolling Stones', 'Led Zeppelin', 'The Who', 'The Beatles'],
    correctAnswer: 'The Beatles',
    explanation: 'John Lennon was a founding member of The Beatles alongside Paul McCartney, George Harrison and Ringo Starr.',
  },
  {
    id: 'en6', category: 'entertainment', difficulty: 'easy',
    question: 'Who wrote the novel "Pride and Prejudice"?',
    options: ['Charlotte Brontë', 'Charles Dickens', 'Emily Brontë', 'Jane Austen'],
    correctAnswer: 'Jane Austen',
    explanation: '"Pride and Prejudice" was published in 1813 by Jane Austen and remains one of the best-selling novels ever.',
  },
  {
    id: 'en7', category: 'entertainment', difficulty: 'easy',
    question: 'In which fictional city does Batman operate?',
    options: ['Metropolis', 'Star City', 'Central City', 'Gotham City'],
    correctAnswer: 'Gotham City',
    explanation: 'Batman has protected the dark, crime-ridden Gotham City since his debut in Detective Comics #27 (1939).',
  },
  // Medium
  {
    id: 'en8', category: 'entertainment', difficulty: 'medium',
    question: 'Which streaming platform produces Stranger Things?',
    options: ['HBO', 'Amazon Prime', 'Disney+', 'Netflix'],
    correctAnswer: 'Netflix',
    explanation: 'Stranger Things has been a Netflix original series since its debut in July 2016.',
  },
  {
    id: 'en9', category: 'entertainment', difficulty: 'medium',
    question: 'Who directed the 2010 science-fiction film "Inception"?',
    options: ['Steven Spielberg', 'James Cameron', 'Ridley Scott', 'Christopher Nolan'],
    correctAnswer: 'Christopher Nolan',
    explanation: 'Christopher Nolan wrote and directed Inception, starring Leonardo DiCaprio as a dream thief.',
  },
  {
    id: 'en10', category: 'entertainment', difficulty: 'medium',
    question: 'In what year was the original iPhone first released?',
    options: ['2005', '2006', '2007', '2008'],
    correctAnswer: '2007',
    explanation: 'Steve Jobs unveiled the first iPhone on January 9, 2007, and it went on sale on June 29, 2007.',
  },
  {
    id: 'en11', category: 'entertainment', difficulty: 'medium',
    question: 'Who sang the 2010 hit "Rolling in the Deep"?',
    options: ['Beyoncé', 'Rihanna', 'Amy Winehouse', 'Adele'],
    correctAnswer: 'Adele',
    explanation: '"Rolling in the Deep" was Adele\'s lead single from her album 21 and became a global number-one hit.',
  },
  {
    id: 'en12', category: 'entertainment', difficulty: 'medium',
    question: 'Which TV show features the fictional Dunder Mifflin Paper Company?',
    options: ['Parks and Recreation', 'Brooklyn Nine-Nine', 'Community', 'The Office'],
    correctAnswer: 'The Office',
    explanation: 'The Office (US version) ran from 2005 to 2013 and was set at the Scranton branch of Dunder Mifflin.',
  },
  {
    id: 'en13', category: 'entertainment', difficulty: 'medium',
    question: 'Which Disney animated film features the character Simba?',
    options: ['Bambi', 'The Jungle Book', 'Tarzan', 'The Lion King'],
    correctAnswer: 'The Lion King',
    explanation: 'The Lion King (1994) follows Simba, a lion cub who reclaims his kingdom after his father\'s murder.',
  },
  {
    id: 'en14', category: 'entertainment', difficulty: 'medium',
    question: 'Who wrote the "A Song of Ice and Fire" novels that inspired Game of Thrones?',
    options: ['J.R.R. Tolkien', 'Terry Pratchett', 'Patrick Rothfuss', 'George R.R. Martin'],
    correctAnswer: 'George R.R. Martin',
    explanation: 'George R.R. Martin began the series with A Game of Thrones in 1996; HBO adapted it from 2011 to 2019.',
  },
  // Hard
  {
    id: 'en15', category: 'entertainment', difficulty: 'hard',
    question: 'In what year was the original Star Wars film (Episode IV) released?',
    options: ['1975', '1976', '1977', '1978'],
    correctAnswer: '1977',
    explanation: 'Star Wars: A New Hope was released on May 25, 1977, becoming a cultural phenomenon and one of the highest-grossing films ever.',
  },
  {
    id: 'en16', category: 'entertainment', difficulty: 'hard',
    question: 'Who composed the film score for "Schindler\'s List" (1993)?',
    options: ['Hans Zimmer', 'Ennio Morricone', 'Bernard Herrmann', 'John Williams'],
    correctAnswer: 'John Williams',
    explanation: 'John Williams composed the haunting score for Schindler\'s List, winning his fifth Academy Award.',
  },
  {
    id: 'en17', category: 'entertainment', difficulty: 'hard',
    question: 'In Breaking Bad, what alias does Walter White use as a drug manufacturer?',
    options: ['The Cook', 'Mr. White', 'The Teacher', 'Heisenberg'],
    correctAnswer: 'Heisenberg',
    explanation: 'Walter White adopts the alias "Heisenberg" — a reference to physicist Werner Heisenberg and his uncertainty principle.',
  },
  {
    id: 'en18', category: 'entertainment', difficulty: 'hard',
    question: 'Which Shakespeare play contains the famous line "To be, or not to be"?',
    options: ['Macbeth', 'Othello', 'King Lear', 'Hamlet'],
    correctAnswer: 'Hamlet',
    explanation: '"To be, or not to be" opens a soliloquy in Act 3, Scene 1 of Shakespeare\'s Hamlet.',
  },
  {
    id: 'en19', category: 'entertainment', difficulty: 'hard',
    question: 'Toy Story (1995) was notable for being the first commercial feature film made entirely using what technology?',
    options: ['Motion Capture', 'Digital Sound', 'Digital Cameras', 'Computer-Generated Imagery'],
    correctAnswer: 'Computer-Generated Imagery',
    explanation: 'Produced by Pixar and released by Disney, Toy Story was the first entirely CGI feature film.',
  },
  {
    id: 'en20', category: 'entertainment', difficulty: 'hard',
    question: 'Who holds the record for the most Grammy Awards won by a solo artist?',
    options: ['Michael Jackson', 'Stevie Wonder', 'Paul McCartney', 'Beyoncé'],
    correctAnswer: 'Beyoncé',
    explanation: 'Beyoncé holds the all-time Grammy record with 32 wins as of 2024, surpassing Georg Solti\'s previous record.',
  },
]

// ─── Finance & Business (20: 7 easy, 7 medium, 6 hard) ───────────────────────

const FINANCE: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'fi1', category: 'finance', difficulty: 'easy',
    question: 'What does CEO stand for?',
    options: ['Central Executive Officer', 'Chief Economic Officer', 'Corporate Executive Officer', 'Chief Executive Officer'],
    correctAnswer: 'Chief Executive Officer',
    explanation: 'CEO stands for Chief Executive Officer — the highest-ranking person in a company.',
  },
  {
    id: 'fi2', category: 'finance', difficulty: 'easy',
    question: 'What does GDP stand for?',
    options: ['General Domestic Price', 'Global Debt Program', 'Growth Domestic Profit', 'Gross Domestic Product'],
    correctAnswer: 'Gross Domestic Product',
    explanation: 'GDP measures the total monetary value of all goods and services produced in a country in a given period.',
  },
  {
    id: 'fi3', category: 'finance', difficulty: 'easy',
    question: 'What is the currency of Japan?',
    options: ['Yuan', 'Won', 'Ringgit', 'Yen'],
    correctAnswer: 'Yen',
    explanation: 'The Japanese Yen (¥) is the official currency of Japan and one of the most traded currencies globally.',
  },
  {
    id: 'fi4', category: 'finance', difficulty: 'easy',
    question: 'What does ATM stand for in banking?',
    options: ['Automatic Transaction Machine', 'Advanced Technology Machine', 'Account Transfer Machine', 'Automated Teller Machine'],
    correctAnswer: 'Automated Teller Machine',
    explanation: 'An ATM is a self-service machine that allows customers to withdraw cash and perform basic banking transactions.',
  },
  {
    id: 'fi5', category: 'finance', difficulty: 'easy',
    question: 'Which company was founded by Jeff Bezos?',
    options: ['Microsoft', 'Google', 'Tesla', 'Amazon'],
    correctAnswer: 'Amazon',
    explanation: 'Jeff Bezos founded Amazon in 1994 as an online bookstore; it grew into the world\'s largest e-commerce company.',
  },
  {
    id: 'fi6', category: 'finance', difficulty: 'easy',
    question: 'What currency do most European Union countries use?',
    options: ['Pound', 'Dollar', 'Franc', 'Euro'],
    correctAnswer: 'Euro',
    explanation: 'The Euro (€) was introduced as an electronic currency in 1999 and as physical coins and notes in 2002.',
  },
  {
    id: 'fi7', category: 'finance', difficulty: 'easy',
    question: 'What does ROI stand for in business?',
    options: ['Rate of Income', 'Risk of Inflation', 'Revenue of Interest', 'Return on Investment'],
    correctAnswer: 'Return on Investment',
    explanation: 'ROI measures the gain or loss generated relative to the amount invested, expressed as a percentage.',
  },
  // Medium
  {
    id: 'fi8', category: 'finance', difficulty: 'medium',
    question: 'What is the world\'s largest stock exchange by market capitalisation?',
    options: ['London Stock Exchange', 'Tokyo Stock Exchange', 'NASDAQ', 'NYSE'],
    correctAnswer: 'NYSE',
    explanation: 'The New York Stock Exchange is the world\'s largest by market capitalisation, hosting companies like Apple and JPMorgan.',
  },
  {
    id: 'fi9', category: 'finance', difficulty: 'medium',
    question: 'What does IPO stand for in finance?',
    options: ['Initial Price Offer', 'International Payment Order', 'Interest Paid Online', 'Initial Public Offering'],
    correctAnswer: 'Initial Public Offering',
    explanation: 'An IPO is when a private company first sells shares to the public on a stock exchange.',
  },
  {
    id: 'fi10', category: 'finance', difficulty: 'medium',
    question: 'What financial term describes a stock market decline of 20% or more from recent highs?',
    options: ['Bull Market', 'Correction', 'Recession', 'Bear Market'],
    correctAnswer: 'Bear Market',
    explanation: 'A bear market is defined as a drop of 20% or more from recent highs, often associated with widespread pessimism.',
  },
  {
    id: 'fi11', category: 'finance', difficulty: 'medium',
    question: 'In which US city is Wall Street located?',
    options: ['Chicago', 'Los Angeles', 'Boston', 'New York City'],
    correctAnswer: 'New York City',
    explanation: 'Wall Street in Lower Manhattan, New York City, is the symbolic centre of the US financial industry.',
  },
  {
    id: 'fi12', category: 'finance', difficulty: 'medium',
    question: 'What is compound interest?',
    options: ['Interest on the principal only', 'A type of bank fee', 'Tax on investments', 'Interest on principal and prior accumulated interest'],
    correctAnswer: 'Interest on principal and prior accumulated interest',
    explanation: 'Compound interest earns interest on both the initial principal and the interest already accumulated, accelerating growth over time.',
  },
  {
    id: 'fi13', category: 'finance', difficulty: 'medium',
    question: 'Who co-founded Microsoft with Bill Gates?',
    options: ['Steve Jobs', 'Larry Ellison', 'Steve Wozniak', 'Paul Allen'],
    correctAnswer: 'Paul Allen',
    explanation: 'Bill Gates and Paul Allen founded Microsoft in 1975 in Albuquerque, New Mexico.',
  },
  {
    id: 'fi14', category: 'finance', difficulty: 'medium',
    question: 'What economic term describes when prices across an economy fall over time?',
    options: ['Inflation', 'Stagflation', 'Deflation', 'Hyperinflation'],
    correctAnswer: 'Deflation',
    explanation: 'Deflation is a decrease in the general price level of goods and services, which can signal weakening economic demand.',
  },
  // Hard
  {
    id: 'fi15', category: 'finance', difficulty: 'hard',
    question: 'Who is considered the "father of modern economics"?',
    options: ['Karl Marx', 'John Maynard Keynes', 'Milton Friedman', 'Adam Smith'],
    correctAnswer: 'Adam Smith',
    explanation: 'Adam Smith\'s "The Wealth of Nations" (1776) established the foundations of classical economics and free-market theory.',
  },
  {
    id: 'fi16', category: 'finance', difficulty: 'hard',
    question: 'What economic theory argues that government spending can stimulate economic growth during downturns?',
    options: ['Supply-Side Economics', 'Monetarism', 'Austrian Economics', 'Keynesian Economics'],
    correctAnswer: 'Keynesian Economics',
    explanation: 'John Maynard Keynes proposed in the 1930s that government fiscal stimulus can counteract recessions.',
  },
  {
    id: 'fi17', category: 'finance', difficulty: 'hard',
    question: 'What does QE stand for in central banking monetary policy?',
    options: ['Quality Enhancement', 'Quick Exchange', 'Quarterly Earnings', 'Quantitative Easing'],
    correctAnswer: 'Quantitative Easing',
    explanation: 'Quantitative Easing is when a central bank creates money to buy financial assets, injecting liquidity into the economy.',
  },
  {
    id: 'fi18', category: 'finance', difficulty: 'hard',
    question: 'The concept of "Black Swan" events in finance was popularised by which author?',
    options: ['Malcolm Gladwell', 'Michael Lewis', 'Warren Buffett', 'Nassim Nicholas Taleb'],
    correctAnswer: 'Nassim Nicholas Taleb',
    explanation: 'Nassim Nicholas Taleb popularised the Black Swan theory in his 2007 book, describing rare, high-impact events.',
  },
  {
    id: 'fi19', category: 'finance', difficulty: 'hard',
    question: 'What does the Dow Jones Industrial Average track?',
    options: ['All US-listed stocks', 'The US government bond rate', 'A currency exchange rate', 'An index of 30 large US companies'],
    correctAnswer: 'An index of 30 large US companies',
    explanation: 'The Dow Jones tracks 30 major US companies and is one of the oldest and most widely cited stock indices.',
  },
  {
    id: 'fi20', category: 'finance', difficulty: 'hard',
    question: 'What term describes the practice of borrowing capital to amplify potential investment returns?',
    options: ['Arbitrage', 'Hedging', 'Diversification', 'Leverage'],
    correctAnswer: 'Leverage',
    explanation: 'Leverage involves using borrowed money to increase potential returns, but also amplifies potential losses.',
  },
]

// ─── Health & Body (20: 7 easy, 7 medium, 6 hard) ────────────────────────────

const HEALTH: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'he1', category: 'health', difficulty: 'easy',
    question: 'How many bones are in the adult human body?',
    options: ['196', '206', '216', '226'],
    correctAnswer: '206',
    explanation: 'Adults have 206 bones. Babies are born with around 270, which fuse together over time.',
  },
  {
    id: 'he2', category: 'health', difficulty: 'easy',
    question: 'Which vitamin does the human body produce when exposed to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 'Vitamin D',
    explanation: 'UVB rays from sunlight trigger the production of Vitamin D in the skin, essential for bone health.',
  },
  {
    id: 'he3', category: 'health', difficulty: 'easy',
    question: 'How many chambers does the human heart have?',
    options: ['2', '3', '4', '5'],
    correctAnswer: '4',
    explanation: 'The heart has 4 chambers: two atria (upper) and two ventricles (lower).',
  },
  {
    id: 'he4', category: 'health', difficulty: 'easy',
    question: 'Which organ is primarily responsible for filtering blood?',
    options: ['Liver', 'Spleen', 'Pancreas', 'Kidney'],
    correctAnswer: 'Kidney',
    explanation: 'The kidneys filter about 180 litres of blood daily, removing waste and excess water as urine.',
  },
  {
    id: 'he5', category: 'health', difficulty: 'easy',
    question: 'What is the normal human body temperature in Celsius?',
    options: ['35°C', '36°C', '37°C', '38°C'],
    correctAnswer: '37°C',
    explanation: 'The average normal body temperature is 37°C (98.6°F), though it varies slightly between individuals.',
  },
  {
    id: 'he6', category: 'health', difficulty: 'easy',
    question: 'How many teeth does a healthy adult typically have (including wisdom teeth)?',
    options: ['28', '30', '32', '34'],
    correctAnswer: '32',
    explanation: 'A full adult set consists of 32 teeth: 8 incisors, 4 canines, 8 premolars, 8 molars (including 4 wisdom teeth).',
  },
  {
    id: 'he7', category: 'health', difficulty: 'easy',
    question: 'What is the largest organ in the human body?',
    options: ['Liver', 'Lung', 'Heart', 'Skin'],
    correctAnswer: 'Skin',
    explanation: 'The skin is the largest organ, covering approximately 1.7–2.0 m² and protecting the body from the environment.',
  },
  // Medium
  {
    id: 'he8', category: 'health', difficulty: 'medium',
    question: 'Which organ produces insulin?',
    options: ['Liver', 'Kidney', 'Spleen', 'Pancreas'],
    correctAnswer: 'Pancreas',
    explanation: 'The pancreas produces insulin (and glucagon) to regulate blood glucose levels.',
  },
  {
    id: 'he9', category: 'health', difficulty: 'medium',
    question: 'What is the name of the largest artery in the human body?',
    options: ['Femoral Artery', 'Carotid Artery', 'Pulmonary Artery', 'Aorta'],
    correctAnswer: 'Aorta',
    explanation: 'The aorta is the main artery leaving the heart, distributing oxygenated blood to the entire body.',
  },
  {
    id: 'he10', category: 'health', difficulty: 'medium',
    question: 'Which vitamin deficiency causes the disease scurvy?',
    options: ['Vitamin A', 'Vitamin B', 'Vitamin D', 'Vitamin C'],
    correctAnswer: 'Vitamin C',
    explanation: 'Scurvy results from a lack of Vitamin C (ascorbic acid), causing fatigue, bleeding gums and slow wound healing.',
  },
  {
    id: 'he11', category: 'health', difficulty: 'medium',
    question: 'What is the medical term for high blood pressure?',
    options: ['Hypotension', 'Tachycardia', 'Bradycardia', 'Hypertension'],
    correctAnswer: 'Hypertension',
    explanation: 'Hypertension (blood pressure above 140/90 mmHg) increases risk of heart disease and stroke.',
  },
  {
    id: 'he12', category: 'health', difficulty: 'medium',
    question: 'Which blood type is the universal donor for red blood cell transfusions?',
    options: ['A negative', 'B negative', 'AB positive', 'O negative'],
    correctAnswer: 'O negative',
    explanation: 'O negative blood has no A, B, or Rh antigens, so it can be given to patients of any blood type in emergencies.',
  },
  {
    id: 'he13', category: 'health', difficulty: 'medium',
    question: 'What is the medical term for inflammation of the appendix?',
    options: ['Gastritis', 'Colitis', 'Hepatitis', 'Appendicitis'],
    correctAnswer: 'Appendicitis',
    explanation: 'Appendicitis is inflammation of the appendix, typically requiring surgical removal (appendectomy).',
  },
  {
    id: 'he14', category: 'health', difficulty: 'medium',
    question: 'How long does the average red blood cell survive in the human body?',
    options: ['30 days', '60 days', '90 days', '120 days'],
    correctAnswer: '120 days',
    explanation: 'Red blood cells live approximately 120 days before being broken down by the spleen and liver.',
  },
  // Hard
  {
    id: 'he15', category: 'health', difficulty: 'hard',
    question: 'What protein in red blood cells carries oxygen around the body?',
    options: ['Myosin', 'Keratin', 'Collagen', 'Hemoglobin'],
    correctAnswer: 'Hemoglobin',
    explanation: 'Hemoglobin is an iron-containing protein that binds oxygen in the lungs and releases it to body tissues.',
  },
  {
    id: 'he16', category: 'health', difficulty: 'hard',
    question: 'Which part of the brain is primarily responsible for balance and coordination?',
    options: ['Cerebrum', 'Hippocampus', 'Medulla Oblongata', 'Cerebellum'],
    correctAnswer: 'Cerebellum',
    explanation: 'The cerebellum coordinates voluntary movements, balance and posture, receiving input from the sensory systems.',
  },
  {
    id: 'he17', category: 'health', difficulty: 'hard',
    question: 'What is the medical term for the kneecap?',
    options: ['Tibia', 'Fibula', 'Femur', 'Patella'],
    correctAnswer: 'Patella',
    explanation: 'The patella (kneecap) is a small bone embedded in the tendon of the quadriceps, protecting the knee joint.',
  },
  {
    id: 'he18', category: 'health', difficulty: 'hard',
    question: 'Approximately how many nephrons are found in each human kidney?',
    options: ['100,000', '500,000', '1,000,000', '5,000,000'],
    correctAnswer: '1,000,000',
    explanation: 'Each kidney contains about one million nephrons — the functional units that filter blood and form urine.',
  },
  {
    id: 'he19', category: 'health', difficulty: 'hard',
    question: 'What is the rarest blood type among humans?',
    options: ['A negative', 'B negative', 'O negative', 'AB negative'],
    correctAnswer: 'AB negative',
    explanation: 'AB negative occurs in only about 1% of the population, making it the rarest of the eight main blood types.',
  },
  {
    id: 'he20', category: 'health', difficulty: 'hard',
    question: 'Which autoimmune disease causes the immune system to attack the myelin sheath around nerve fibres?',
    options: ['Lupus', 'Rheumatoid Arthritis', 'Type 1 Diabetes', 'Multiple Sclerosis'],
    correctAnswer: 'Multiple Sclerosis',
    explanation: 'In multiple sclerosis (MS), the immune system attacks myelin, disrupting nerve signals and causing a range of neurological symptoms.',
  },
]

// ─── Art & Music (20: 7 easy, 7 medium, 6 hard) ──────────────────────────────

const ARTS: KnowledgeQuestion[] = [
  // Easy
  {
    id: 'ar1', category: 'arts', difficulty: 'easy',
    question: 'Who painted the Mona Lisa?',
    options: ['Michelangelo', 'Raphael', 'Botticelli', 'Leonardo da Vinci'],
    correctAnswer: 'Leonardo da Vinci',
    explanation: 'Leonardo da Vinci painted the Mona Lisa between approximately 1503 and 1519; it now hangs in the Louvre, Paris.',
  },
  {
    id: 'ar2', category: 'arts', difficulty: 'easy',
    question: 'Who painted "The Starry Night"?',
    options: ['Paul Gauguin', 'Paul Cézanne', 'Henri Matisse', 'Vincent van Gogh'],
    correctAnswer: 'Vincent van Gogh',
    explanation: 'Vincent van Gogh painted The Starry Night in June 1889 while staying at the Saint-Paul-de-Mausole asylum.',
  },
  {
    id: 'ar3', category: 'arts', difficulty: 'easy',
    question: 'How many strings does a standard acoustic guitar have?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
    explanation: 'A standard guitar has 6 strings, tuned (low to high) to E, A, D, G, B, E.',
  },
  {
    id: 'ar4', category: 'arts', difficulty: 'easy',
    question: 'In music, what does the Italian term "forte" mean?',
    options: ['Slow', 'Quiet', 'Fast', 'Loud'],
    correctAnswer: 'Loud',
    explanation: '"Forte" (f) means loud in musical notation; its opposite is "piano" (p), meaning soft.',
  },
  {
    id: 'ar5', category: 'arts', difficulty: 'easy',
    question: 'Who composed the four concertos known as "The Four Seasons"?',
    options: ['Johann Sebastian Bach', 'George Frideric Handel', 'Joseph Haydn', 'Antonio Vivaldi'],
    correctAnswer: 'Antonio Vivaldi',
    explanation: 'Antonio Vivaldi composed Le quattro stagioni (The Four Seasons) around 1716–1717.',
  },
  {
    id: 'ar6', category: 'arts', difficulty: 'easy',
    question: 'What is the Japanese art of folding paper into decorative shapes called?',
    options: ['Kirigami', 'Ikebana', 'Bonsai', 'Origami'],
    correctAnswer: 'Origami',
    explanation: 'Origami (from "oru" — fold, and "kami" — paper) is the traditional Japanese art of paper folding.',
  },
  {
    id: 'ar7', category: 'arts', difficulty: 'easy',
    question: 'Who composed the famous piano piece "Moonlight Sonata"?',
    options: ['Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Franz Schubert', 'Ludwig van Beethoven'],
    correctAnswer: 'Ludwig van Beethoven',
    explanation: 'Beethoven composed his Piano Sonata No. 14 in C♯ minor, nicknamed "Moonlight Sonata", in 1801.',
  },
  // Medium
  {
    id: 'ar8', category: 'arts', difficulty: 'medium',
    question: 'How many symphonies did Ludwig van Beethoven compose?',
    options: ['7', '8', '9', '10'],
    correctAnswer: '9',
    explanation: 'Beethoven composed 9 symphonies; his Ninth (the "Choral") is perhaps the most famous, featuring "Ode to Joy".',
  },
  {
    id: 'ar9', category: 'arts', difficulty: 'medium',
    question: 'Who painted the ceiling of the Sistine Chapel?',
    options: ['Leonardo da Vinci', 'Raphael', 'Donatello', 'Michelangelo'],
    correctAnswer: 'Michelangelo',
    explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512 for Pope Julius II.',
  },
  {
    id: 'ar10', category: 'arts', difficulty: 'medium',
    question: 'What is a sonnet in poetry?',
    options: ['A short story', 'A type of sculpture', 'A musical composition', 'A 14-line poem'],
    correctAnswer: 'A 14-line poem',
    explanation: 'A sonnet is a 14-line poem, typically in iambic pentameter, often exploring themes of love and time.',
  },
  {
    id: 'ar11', category: 'arts', difficulty: 'medium',
    question: 'Which art movement is Pablo Picasso primarily associated with?',
    options: ['Impressionism', 'Surrealism', 'Expressionism', 'Cubism'],
    correctAnswer: 'Cubism',
    explanation: 'Picasso co-founded Cubism with Georges Braque around 1907–1914, depicting subjects from multiple viewpoints simultaneously.',
  },
  {
    id: 'ar12', category: 'arts', difficulty: 'medium',
    question: 'How many keys does a standard full-size piano have?',
    options: ['72', '80', '88', '96'],
    correctAnswer: '88',
    explanation: 'A standard piano has 88 keys: 52 white and 36 black, spanning over 7 octaves.',
  },
  {
    id: 'ar13', category: 'arts', difficulty: 'medium',
    question: 'Which composer is known as the "Father of the Symphony"?',
    options: ['Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Ludwig van Beethoven', 'Franz Joseph Haydn'],
    correctAnswer: 'Franz Joseph Haydn',
    explanation: 'Haydn wrote 104 symphonies and is credited with developing the classical symphonic form.',
  },
  {
    id: 'ar14', category: 'arts', difficulty: 'medium',
    question: 'In which Australian city is the famous Opera House located?',
    options: ['Melbourne', 'Brisbane', 'Perth', 'Sydney'],
    correctAnswer: 'Sydney',
    explanation: 'The Sydney Opera House, designed by Jørn Utzon, opened in 1973 and is a UNESCO World Heritage Site.',
  },
  // Hard
  {
    id: 'ar15', category: 'arts', difficulty: 'hard',
    question: 'Who composed the opera "La Traviata"?',
    options: ['Giacomo Puccini', 'Wolfgang Amadeus Mozart', 'Georges Bizet', 'Giuseppe Verdi'],
    correctAnswer: 'Giuseppe Verdi',
    explanation: '"La Traviata" was composed by Giuseppe Verdi and premiered in Venice in 1853, based on Alexandre Dumas\'s novel.',
  },
  {
    id: 'ar16', category: 'arts', difficulty: 'hard',
    question: 'What is the term for a painting technique executed on freshly laid, wet plaster?',
    options: ['Tempera', 'Gouache', 'Encaustic', 'Fresco'],
    correctAnswer: 'Fresco',
    explanation: 'Fresco painting binds pigment directly into wet plaster as it dries, creating a durable finish — used by Michelangelo on the Sistine Chapel.',
  },
  {
    id: 'ar17', category: 'arts', difficulty: 'hard',
    question: 'Who sculpted the marble statue of "David" housed in Florence?',
    options: ['Leonardo da Vinci', 'Raphael', 'Donatello', 'Michelangelo'],
    correctAnswer: 'Michelangelo',
    explanation: 'Michelangelo carved David between 1501 and 1504 from a single block of Carrara marble; it stands 5.17 metres tall.',
  },
  {
    id: 'ar18', category: 'arts', difficulty: 'hard',
    question: 'Which Dutch Golden Age painter created "Girl with a Pearl Earring" (c. 1665)?',
    options: ['Rembrandt van Rijn', 'Frans Hals', 'Jan Steen', 'Johannes Vermeer'],
    correctAnswer: 'Johannes Vermeer',
    explanation: '"Girl with a Pearl Earring" is often called the "Mona Lisa of the North" and is housed in the Mauritshuis, The Hague.',
  },
  {
    id: 'ar19', category: 'arts', difficulty: 'hard',
    question: 'What musical time signature indicates three beats per bar?',
    options: ['2/4', '4/4', '6/8', '3/4'],
    correctAnswer: '3/4',
    explanation: '3/4 time (waltz time) has three quarter-note beats per bar, giving it a distinctive 1-2-3 feel.',
  },
  {
    id: 'ar20', category: 'arts', difficulty: 'hard',
    question: 'Andy Warhol\'s famous 1962 series depicted which everyday consumer product?',
    options: ['Coca-Cola Bottles', 'Banana Series', 'Elvis Prints', 'Campbell\'s Soup Cans'],
    correctAnswer: 'Campbell\'s Soup Cans',
    explanation: 'Warhol\'s 32 Campbell\'s Soup Cans (1961–62) became a defining work of Pop Art, now in the Museum of Modern Art, New York.',
  },
]

// ─── Combined export ──────────────────────────────────────────────────────────

export const KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  ...SCIENCE,
  ...HISTORY,
  ...SPORTS,
  ...ENTERTAINMENT,
  ...FINANCE,
  ...HEALTH,
  ...ARTS,
]

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getQuestions(
  category: KnowledgeCategory | 'all',
  count: number,
  difficulty: KnowledgeDifficulty | 'all',
): KnowledgeQuestion[] {
  let pool = KNOWLEDGE_QUESTIONS
  if (category !== 'all') pool = pool.filter(q => q.category === category)
  if (difficulty !== 'all') pool = pool.filter(q => q.difficulty === difficulty)
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

export function getArenaQuestions(): KnowledgeQuestion[] {
  const cats: KnowledgeCategory[] = [
    'science', 'history', 'sports', 'entertainment', 'finance', 'health', 'arts',
  ]
  const result: KnowledgeQuestion[] = []
  for (let round = 0; round < 2; round++) {
    for (const cat of cats) {
      const pool = KNOWLEDGE_QUESTIONS
        .filter(q => q.category === cat)
        .sort(() => Math.random() - 0.5)
      result.push(pool[round])
    }
  }
  return result
}

export function getDailyQuestions(): KnowledgeQuestion[] {
  const day  = new Date().getDate() - 1
  const cats: KnowledgeCategory[] = [
    'science', 'history', 'sports', 'entertainment', 'finance', 'health', 'arts',
  ]
  return cats.map((cat, i) => {
    const pool = KNOWLEDGE_QUESTIONS.filter(q => q.category === cat)
    return pool[(day * 3 + i * 7) % pool.length]
  })
}
