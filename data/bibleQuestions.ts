import type { BibleQuestion, VerseQuestion, TimelineQuestion, DailyChallenge } from '../types/bible'

export const BIBLE_QUESTIONS: BibleQuestion[] = [
  // ── EASY (30) ─────────────────────────────────────────────────────────────

  // easy · people
  { id: 'q001', question: 'Who built the ark to survive the great flood?', options: ['Moses', 'Noah', 'Abraham', 'David'], correctAnswer: 'Noah', explanation: 'God commanded Noah to build an ark to save his family and animals from the great flood.', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q002', question: 'Who was the first man created by God?', options: ['Abel', 'Seth', 'Adam', 'Noah'], correctAnswer: 'Adam', explanation: 'God formed Adam from the dust of the ground and breathed life into him (Genesis 2:7).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q003', question: 'Who was sold into slavery by his brothers?', options: ['Benjamin', 'Reuben', 'Moses', 'Joseph'], correctAnswer: 'Joseph', explanation: 'Joseph\'s brothers sold him to Ishmaelite traders for twenty pieces of silver (Genesis 37:28).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q004', question: 'Who led the Israelites out of Egypt?', options: ['Joshua', 'Aaron', 'Moses', 'Elijah'], correctAnswer: 'Moses', explanation: 'God chose Moses to confront Pharaoh and lead Israel out of slavery in Egypt (Exodus 3).', book: 'Exodus', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q005', question: 'Who was the first king of Israel?', options: ['David', 'Solomon', 'Saul', 'Samuel'], correctAnswer: 'Saul', explanation: 'Samuel anointed Saul from the tribe of Benjamin as the first king of Israel (1 Samuel 10:1).', book: '1 Samuel', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q006', question: 'Who killed the giant Goliath with a sling?', options: ['Saul', 'Jonathan', 'David', 'Samuel'], correctAnswer: 'David', explanation: 'The young shepherd David killed Goliath with a single stone from his sling (1 Samuel 17:50).', book: '1 Samuel', testament: 'old', difficulty: 'easy', category: 'people' },
  { id: 'q007', question: 'Who baptized Jesus in the Jordan River?', options: ['Peter', 'Andrew', 'John the Baptist', 'Philip'], correctAnswer: 'John the Baptist', explanation: 'John the Baptist baptized Jesus in the Jordan River, and the Holy Spirit descended like a dove (Matthew 3:16).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'people' },
  { id: 'q008', question: 'Who betrayed Jesus for thirty pieces of silver?', options: ['Peter', 'Thomas', 'Judas', 'Bartholomew'], correctAnswer: 'Judas', explanation: 'Judas Iscariot agreed to betray Jesus to the chief priests for thirty pieces of silver (Matthew 26:15).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'people' },
  { id: 'q009', question: 'Who denied Jesus three times before the rooster crowed?', options: ['James', 'John', 'Peter', 'Andrew'], correctAnswer: 'Peter', explanation: 'Peter denied knowing Jesus three times that night, just as Jesus had predicted (Matthew 26:75).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'people' },
  { id: 'q010', question: 'Who was the mother of Jesus?', options: ['Elizabeth', 'Anna', 'Martha', 'Mary'], correctAnswer: 'Mary', explanation: 'The angel Gabriel announced to Mary that she would conceive and bear the Son of God (Luke 1:31).', book: 'Luke', testament: 'new', difficulty: 'easy', category: 'people' },

  // easy · places
  { id: 'q011', question: 'In which city was Jesus born?', options: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Jericho'], correctAnswer: 'Bethlehem', explanation: 'Jesus was born in Bethlehem of Judea, fulfilling the prophecy of Micah 5:2 (Matthew 2:1).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'places' },
  { id: 'q012', question: 'Where did Adam and Eve live before the Fall?', options: ['Canaan', 'Eden', 'Sinai', 'Babylon'], correctAnswer: 'Eden', explanation: 'God placed Adam and Eve in the Garden of Eden to tend and keep it (Genesis 2:15).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'places' },
  { id: 'q013', question: 'On which mountain did Moses receive the Ten Commandments?', options: ['Mount Zion', 'Mount Carmel', 'Mount Sinai', 'Mount Hermon'], correctAnswer: 'Mount Sinai', explanation: 'God called Moses up to Mount Sinai and gave him the law written on two stone tablets (Exodus 19–20).', book: 'Exodus', testament: 'old', difficulty: 'easy', category: 'places' },
  { id: 'q014', question: 'Which sea did Moses part so the Israelites could escape Pharaoh?', options: ['Dead Sea', 'Sea of Galilee', 'Mediterranean Sea', 'Red Sea'], correctAnswer: 'Red Sea', explanation: 'Moses stretched out his hand and the LORD drove the Red Sea back with a strong east wind (Exodus 14:21).', book: 'Exodus', testament: 'old', difficulty: 'easy', category: 'places' },
  { id: 'q015', question: 'In which river was Jesus baptized?', options: ['Nile', 'Euphrates', 'Jordan', 'Tigris'], correctAnswer: 'Jordan', explanation: 'Jesus came from Galilee to the Jordan River to be baptized by John (Matthew 3:13).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'places' },

  // easy · events
  { id: 'q016', question: 'How many days did it rain during Noah\'s flood?', options: ['20', '30', '40', '50'], correctAnswer: '40', explanation: 'Rain fell on the earth for forty days and forty nights during the great flood (Genesis 7:12).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'events' },
  { id: 'q017', question: 'What did Jesus turn water into at the wedding in Cana?', options: ['Milk', 'Oil', 'Wine', 'Honey'], correctAnswer: 'Wine', explanation: 'Jesus turned water into wine at a wedding in Cana — his first recorded miracle (John 2:1–11).', book: 'John', testament: 'new', difficulty: 'easy', category: 'events' },
  { id: 'q018', question: 'On which day did Jesus rise from the dead?', options: ['First day', 'Second day', 'Third day', 'Fourth day'], correctAnswer: 'Third day', explanation: 'Jesus rose from the dead on the third day after his crucifixion, as he had foretold (Matthew 28:6).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'events' },
  { id: 'q019', question: 'How many plagues did God send on Egypt?', options: ['7', '8', '10', '12'], correctAnswer: '10', explanation: 'God sent ten plagues on Egypt to persuade Pharaoh to release the Israelites (Exodus 7–12).', book: 'Exodus', testament: 'old', difficulty: 'easy', category: 'events' },
  { id: 'q020', question: 'What sign did God put in the sky after the flood?', options: ['A star', 'A rainbow', 'A burning cloud', 'A dove'], correctAnswer: 'A rainbow', explanation: 'God set a rainbow in the clouds as the sign of his covenant never to flood the entire earth again (Genesis 9:13).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'events' },

  // easy · numbers
  { id: 'q021', question: 'How many books are in the New Testament?', options: ['24', '27', '29', '31'], correctAnswer: '27', explanation: 'The New Testament contains 27 books, from Matthew to Revelation.', book: 'General', testament: 'new', difficulty: 'easy', category: 'numbers' },
  { id: 'q022', question: 'How many books are in the Old Testament?', options: ['36', '39', '42', '45'], correctAnswer: '39', explanation: 'The Protestant Old Testament contains 39 books, from Genesis to Malachi.', book: 'General', testament: 'old', difficulty: 'easy', category: 'numbers' },
  { id: 'q023', question: 'How many commandments did God give Moses on Mount Sinai?', options: ['5', '8', '10', '12'], correctAnswer: '10', explanation: 'God gave Moses the Ten Commandments written on two stone tablets (Exodus 20).', book: 'Exodus', testament: 'old', difficulty: 'easy', category: 'numbers' },
  { id: 'q024', question: 'How many disciples did Jesus choose?', options: ['7', '10', '12', '14'], correctAnswer: '12', explanation: 'Jesus chose twelve disciples to be with him and to send out to preach (Mark 3:14).', book: 'Mark', testament: 'new', difficulty: 'easy', category: 'numbers' },
  { id: 'q025', question: 'How many sons did Jacob have?', options: ['10', '11', '12', '13'], correctAnswer: '12', explanation: 'Jacob had twelve sons who became the ancestors of the twelve tribes of Israel (Genesis 35:22–26).', book: 'Genesis', testament: 'old', difficulty: 'easy', category: 'numbers' },

  // easy · verses
  { id: 'q026', question: 'What is the shortest verse in the Bible?', options: ['Pray always', 'God is love', 'Jesus wept', 'Fear not'], correctAnswer: 'Jesus wept', explanation: '"Jesus wept" (John 11:35) is widely considered the shortest verse in the English Bible.', book: 'John', testament: 'new', difficulty: 'easy', category: 'verses' },
  { id: 'q027', question: 'According to John 3:16, God gave his only Son so that whoever believes will not perish but have what?', options: ['Peace on earth', 'Eternal life', 'Forgiveness only', 'A new heart'], correctAnswer: 'Eternal life', explanation: '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life" (John 3:16).', book: 'John', testament: 'new', difficulty: 'easy', category: 'verses' },
  { id: 'q028', question: 'Psalm 23 begins "The LORD is my ___"', options: ['rock', 'fortress', 'shepherd', 'shield'], correctAnswer: 'shepherd', explanation: 'Psalm 23:1 opens with "The LORD is my shepherd; I shall not want."', book: 'Psalms', testament: 'old', difficulty: 'easy', category: 'verses' },
  { id: 'q029', question: 'According to Proverbs 9:10, what is the beginning of wisdom?', options: ['Knowledge', 'Understanding', 'Fear of the LORD', 'Humility'], correctAnswer: 'Fear of the LORD', explanation: '"The fear of the LORD is the beginning of wisdom, and knowledge of the Holy One is understanding" (Proverbs 9:10).', book: 'Proverbs', testament: 'old', difficulty: 'easy', category: 'verses' },
  { id: 'q030', question: 'What did the two greatest commandments say to do, according to Jesus?', options: ['Keep the Sabbath and pray daily', 'Love God and love your neighbor', 'Do not murder and do not steal', 'Believe in God and follow Moses'], correctAnswer: 'Love God and love your neighbor', explanation: 'Jesus said all the Law and Prophets hang on loving God with all your heart and loving your neighbor as yourself (Matthew 22:37–40).', book: 'Matthew', testament: 'new', difficulty: 'easy', category: 'verses' },

  // ── MEDIUM (40) ───────────────────────────────────────────────────────────

  // medium · people
  { id: 'q031', question: 'Who was the mother of Samuel, who prayed fervently for a child?', options: ['Deborah', 'Hannah', 'Rahab', 'Naomi'], correctAnswer: 'Hannah', explanation: 'Hannah prayed at the tabernacle in deep anguish; God opened her womb and she bore Samuel (1 Samuel 1:20).', book: '1 Samuel', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q032', question: 'Which prophet confronted King David about his sin with Bathsheba?', options: ['Elijah', 'Isaiah', 'Nathan', 'Gad'], correctAnswer: 'Nathan', explanation: 'The prophet Nathan told David a parable about a stolen lamb to expose his sin (2 Samuel 12:1–7).', book: '2 Samuel', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q033', question: 'Who was the Moabite woman who pledged loyalty to her mother-in-law Naomi?', options: ['Orpah', 'Tamar', 'Rahab', 'Ruth'], correctAnswer: 'Ruth', explanation: 'Ruth said to Naomi: "Where you go I will go, and where you stay I will stay" (Ruth 1:16).', book: 'Ruth', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q034', question: 'Which judge of Israel was known for supernatural strength from his uncut hair?', options: ['Gideon', 'Jephthah', 'Deborah', 'Samson'], correctAnswer: 'Samson', explanation: 'Samson was a Nazirite set apart from birth; his strength came from his uncut hair as a sign of his vow (Judges 13–16).', book: 'Judges', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q035', question: 'Who was the Persian queen who saved the Jewish people from Haman\'s plot to destroy them?', options: ['Vashti', 'Abigail', 'Esther', 'Judith'], correctAnswer: 'Esther', explanation: 'Queen Esther risked her life to approach the king and expose Haman\'s genocidal plot against the Jews (Esther 7).', book: 'Esther', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q036', question: 'Who was the tax collector that Jesus called down from a sycamore tree?', options: ['Matthew', 'Levi', 'Zacchaeus', 'Bartimaeus'], correctAnswer: 'Zacchaeus', explanation: 'Zacchaeus, a chief tax collector, climbed a sycamore tree to see Jesus; Jesus called him down and dined with him (Luke 19:1–10).', book: 'Luke', testament: 'new', difficulty: 'medium', category: 'people' },
  { id: 'q037', question: 'Which disciple is called "the beloved disciple" in the Gospel of John?', options: ['Peter', 'James', 'John', 'Andrew'], correctAnswer: 'John', explanation: 'The phrase "the disciple whom Jesus loved" appears five times in John\'s Gospel and is traditionally understood to refer to John himself.', book: 'John', testament: 'new', difficulty: 'medium', category: 'people' },
  { id: 'q038', question: 'Who was the first Christian martyr, stoned to death in Jerusalem?', options: ['James', 'Philip', 'Stephen', 'Barnabas'], correctAnswer: 'Stephen', explanation: 'Stephen, full of grace and power, was brought before the council and stoned after giving a bold speech (Acts 7:54–60).', book: 'Acts', testament: 'new', difficulty: 'medium', category: 'people' },
  { id: 'q039', question: 'Who rebuilt the walls of Jerusalem after the Babylonian exile?', options: ['Ezra', 'Zerubbabel', 'Nehemiah', 'Mordecai'], correctAnswer: 'Nehemiah', explanation: 'Nehemiah led the rebuilding of Jerusalem\'s broken walls, completing the work in fifty-two days (Nehemiah 6:15).', book: 'Nehemiah', testament: 'old', difficulty: 'medium', category: 'people' },
  { id: 'q040', question: 'Which Pharisee visited Jesus at night to learn about being born again?', options: ['Gamaliel', 'Nicodemus', 'Joseph of Arimathea', 'Saul'], correctAnswer: 'Nicodemus', explanation: 'Nicodemus came to Jesus by night and heard that no one can see the kingdom of God unless they are born again (John 3:1–3).', book: 'John', testament: 'new', difficulty: 'medium', category: 'people' },

  // medium · places
  { id: 'q041', question: 'In which city were followers of Jesus first called Christians?', options: ['Jerusalem', 'Antioch', 'Rome', 'Ephesus'], correctAnswer: 'Antioch', explanation: 'The disciples were first called Christians in Antioch, the base of Paul\'s missionary journeys (Acts 11:26).', book: 'Acts', testament: 'new', difficulty: 'medium', category: 'places' },
  { id: 'q042', question: 'On which island was the Apostle John when he received the visions of Revelation?', options: ['Cyprus', 'Crete', 'Patmos', 'Malta'], correctAnswer: 'Patmos', explanation: 'John was on the island of Patmos, exiled for the word of God, when he received the Revelation (Revelation 1:9).', book: 'Revelation', testament: 'new', difficulty: 'medium', category: 'places' },
  { id: 'q043', question: 'Which city\'s walls fell flat after the Israelites marched around them?', options: ['Jerusalem', 'Ai', 'Jericho', 'Gibeon'], correctAnswer: 'Jericho', explanation: 'After Israel marched around Jericho for seven days and the priests blew their trumpets, the walls collapsed (Joshua 6:20).', book: 'Joshua', testament: 'old', difficulty: 'medium', category: 'places' },
  { id: 'q044', question: 'Where did Elijah defeat the four hundred and fifty prophets of Baal?', options: ['Mount Sinai', 'Mount Carmel', 'Mount Zion', 'Mount Tabor'], correctAnswer: 'Mount Carmel', explanation: 'Elijah called down fire from heaven on Mount Carmel, proving the LORD is God (1 Kings 18:38).', book: '1 Kings', testament: 'old', difficulty: 'medium', category: 'places' },
  { id: 'q045', question: 'In which city did the Holy Spirit come on the disciples at Pentecost?', options: ['Antioch', 'Ephesus', 'Jerusalem', 'Rome'], correctAnswer: 'Jerusalem', explanation: 'The disciples were gathered in Jerusalem when the Holy Spirit fell like tongues of fire and they spoke in other languages (Acts 2:1–4).', book: 'Acts', testament: 'new', difficulty: 'medium', category: 'places' },
  { id: 'q046', question: 'In which garden was Jesus arrested the night before his crucifixion?', options: ['Garden of Eden', 'Garden of Joseph', 'Garden of Gethsemane', 'Garden Tomb'], correctAnswer: 'Garden of Gethsemane', explanation: 'Jesus went to Gethsemane to pray and was arrested there after Judas identified him with a kiss (Matthew 26:36–50).', book: 'Matthew', testament: 'new', difficulty: 'medium', category: 'places' },

  // medium · events
  { id: 'q047', question: 'What happened to the tower of Babel?', options: ['It was destroyed by fire', 'God confused the builders\' languages', 'It was struck by lightning', 'It collapsed on its own'], correctAnswer: 'God confused the builders\' languages', explanation: 'God confused the language of the builders so they could not understand each other and scattered them over the earth (Genesis 11:7–8).', book: 'Genesis', testament: 'old', difficulty: 'medium', category: 'events' },
  { id: 'q048', question: 'How did Gideon test whether God was calling him, using wool?', options: ['He burned it as an offering', 'He asked for it to be wet while the ground stayed dry, then vice versa', 'He wove it into priestly garments', 'He threw it into the Jordan River'], correctAnswer: 'He asked for it to be wet while the ground stayed dry, then vice versa', explanation: 'Gideon twice tested God with a fleece of wool, asking once for wet fleece on dry ground and once for dry fleece on wet ground (Judges 6:36–40).', book: 'Judges', testament: 'old', difficulty: 'medium', category: 'events' },
  { id: 'q049', question: 'What meal was Jesus celebrating with his disciples at the Last Supper?', options: ['Feast of Tabernacles', 'Feast of Weeks', 'Passover', 'Hanukkah'], correctAnswer: 'Passover', explanation: 'Jesus shared the Passover meal with his disciples the night before his crucifixion and instituted Communion (Luke 22:14–20).', book: 'Luke', testament: 'new', difficulty: 'medium', category: 'events' },
  { id: 'q050', question: 'What happened to Paul and Silas when they prayed in prison at midnight?', options: ['The guards fell asleep', 'An angel appeared to them', 'A violent earthquake freed them', 'The doors opened silently'], correctAnswer: 'A violent earthquake freed them', explanation: 'A great earthquake shook the prison foundations, opened all the doors, and loosed everyone\'s chains (Acts 16:26).', book: 'Acts', testament: 'new', difficulty: 'medium', category: 'events' },
  { id: 'q051', question: 'How did Elijah leave the earth?', options: ['He died of old age', 'He was buried by angels', 'He was taken to heaven in a whirlwind by a chariot of fire', 'He was translated like Enoch quietly'], correctAnswer: 'He was taken to heaven in a whirlwind by a chariot of fire', explanation: 'As Elijah and Elisha walked, a chariot of fire and horses of fire appeared; Elijah went up in a whirlwind to heaven (2 Kings 2:11).', book: '2 Kings', testament: 'old', difficulty: 'medium', category: 'events' },
  { id: 'q052', question: 'How many days was Lazarus in the tomb when Jesus raised him?', options: ['1', '2', '3', '4'], correctAnswer: '4', explanation: 'By the time Jesus arrived at Bethany, Lazarus had already been in the tomb four days (John 11:17).', book: 'John', testament: 'new', difficulty: 'medium', category: 'events' },
  { id: 'q053', question: 'What miracle did Jesus perform immediately after being baptized — before his ministry began?', options: ['Turned water to wine', 'Healed a blind man', 'Nothing — he was then led to the wilderness', 'Fed five thousand people'], correctAnswer: 'Nothing — he was then led to the wilderness', explanation: 'Immediately after his baptism the Spirit led Jesus into the wilderness where he fasted forty days and was tempted (Matthew 4:1).', book: 'Matthew', testament: 'new', difficulty: 'medium', category: 'events' },
  { id: 'q054', question: 'What did the handwriting on Belshazzar\'s palace wall say?', options: ['You are weighed and found worthy', 'MENE MENE TEKEL PARSIN', 'The kingdom shall be divided', 'Your days are numbered'], correctAnswer: 'MENE MENE TEKEL PARSIN', explanation: 'The mysterious inscription "MENE MENE TEKEL PARSIN" foretold Belshazzar\'s doom; Daniel interpreted it that night (Daniel 5:25).', book: 'Daniel', testament: 'old', difficulty: 'medium', category: 'events' },

  // medium · numbers
  { id: 'q055', question: 'How many years did the Israelites wander in the wilderness?', options: ['20', '30', '40', '50'], correctAnswer: '40', explanation: 'Because of their unbelief after the spies\' report, Israel wandered in the wilderness forty years (Numbers 14:33).', book: 'Numbers', testament: 'old', difficulty: 'medium', category: 'numbers' },
  { id: 'q056', question: 'How many men did Gideon use to defeat the Midianite army?', options: ['100', '200', '300', '400'], correctAnswer: '300', explanation: 'God whittled Gideon\'s army down to three hundred men to ensure Israel knew the victory was from God (Judges 7:7).', book: 'Judges', testament: 'old', difficulty: 'medium', category: 'numbers' },
  { id: 'q057', question: 'How many Psalms are in the Book of Psalms?', options: ['100', '120', '150', '175'], correctAnswer: '150', explanation: 'The Book of Psalms contains one hundred and fifty psalms, making it the longest book in the Bible by chapter count.', book: 'Psalms', testament: 'old', difficulty: 'medium', category: 'numbers' },
  { id: 'q058', question: 'How many people were fed with five loaves and two fish?', options: ['2,000', '3,000', '4,000', '5,000'], correctAnswer: '5,000', explanation: 'Five thousand men — besides women and children — were fed when Jesus multiplied five loaves and two fish (Matthew 14:21).', book: 'Matthew', testament: 'new', difficulty: 'medium', category: 'numbers' },
  { id: 'q059', question: 'How many days after his resurrection did Jesus ascend to heaven?', options: ['3', '7', '40', '50'], correctAnswer: '40', explanation: 'Jesus appeared to his disciples over a period of forty days before ascending into heaven (Acts 1:3).', book: 'Acts', testament: 'new', difficulty: 'medium', category: 'numbers' },
  { id: 'q060', question: 'How many books does the entire Protestant Bible contain?', options: ['60', '66', '70', '72'], correctAnswer: '66', explanation: 'The Protestant Bible contains sixty-six books: thirty-nine in the Old Testament and twenty-seven in the New.', book: 'General', testament: 'both', difficulty: 'medium', category: 'numbers' },

  // medium · verses
  { id: 'q061', question: 'Philippians 4:13 says "I can do all things through ___"', options: ['God who blesses me', 'Christ who strengthens me', 'faith that sustains me', 'the Spirit who guides me'], correctAnswer: 'Christ who strengthens me', explanation: '"I can do all things through Christ who strengthens me" (Philippians 4:13) — Paul wrote this from prison.', book: 'Philippians', testament: 'new', difficulty: 'medium', category: 'verses' },
  { id: 'q062', question: 'Complete Romans 8:28: "all things work together for good to those who ___"', options: ['believe in God', 'love God', 'obey God', 'seek God'], correctAnswer: 'love God', explanation: '"And we know that in all things God works for the good of those who love him, who have been called according to his purpose" (Romans 8:28).', book: 'Romans', testament: 'new', difficulty: 'medium', category: 'verses' },
  { id: 'q063', question: 'What does Jeremiah 29:11 say God\'s plans for his people are?', options: ['Plans of judgment and correction', 'Plans to prosper and give hope and a future', 'Plans for obedience and sacrifice', 'Plans to test and refine'], correctAnswer: 'Plans to prosper and give hope and a future', explanation: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future" (Jeremiah 29:11).', book: 'Jeremiah', testament: 'old', difficulty: 'medium', category: 'verses' },
  { id: 'q064', question: 'What does Isaiah 40:31 say will happen to those who hope in the LORD?', options: ['They will receive great riches', 'They will renew their strength and soar on wings like eagles', 'They will live to a very old age', 'They will have no enemies'], correctAnswer: 'They will renew their strength and soar on wings like eagles', explanation: '"Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary" (Isaiah 40:31).', book: 'Isaiah', testament: 'old', difficulty: 'medium', category: 'verses' },
  { id: 'q065', question: 'What does Micah 6:8 say the LORD requires of us?', options: ['Sacrifice and fasting', 'To act justly, love mercy, and walk humbly with God', 'Prayer and tithing', 'Obedience to the law'], correctAnswer: 'To act justly, love mercy, and walk humbly with God', explanation: '"He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God" (Micah 6:8).', book: 'Micah', testament: 'old', difficulty: 'medium', category: 'verses' },
  { id: 'q066', question: 'In Proverbs 3:5, we are told to trust in the LORD with all our heart and not to ___', options: ['lean on our own understanding', 'follow our own desires', 'seek human counsel', 'rely on our wisdom'], correctAnswer: 'lean on our own understanding', explanation: '"Trust in the LORD with all your heart and lean not on your own understanding" (Proverbs 3:5).', book: 'Proverbs', testament: 'old', difficulty: 'medium', category: 'verses' },

  // ── HARD (30) ─────────────────────────────────────────────────────────────

  // hard · people
  { id: 'q067', question: 'Who was the king of Salem and priest of God Most High who blessed Abraham after his battle?', options: ['Abimelech', 'Melchizedek', 'Aner', 'Mamre'], correctAnswer: 'Melchizedek', explanation: 'Melchizedek, king of Salem and priest of God Most High, brought bread and wine and blessed Abram after the victory (Genesis 14:18–20).', book: 'Genesis', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q068', question: 'Which prophet was from Tekoa and worked as a shepherd and dresser of sycamore figs before God called him?', options: ['Hosea', 'Joel', 'Amos', 'Obadiah'], correctAnswer: 'Amos', explanation: 'Amos said "I was neither a prophet nor the son of a prophet, but I was a shepherd, and I also took care of sycamore-fig trees" (Amos 7:14).', book: 'Amos', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q069', question: 'Who was the Aramean commander cured of leprosy after washing in the Jordan River seven times?', options: ['Ben-Hadad', 'Hazael', 'Naaman', 'Rezin'], correctAnswer: 'Naaman', explanation: 'Naaman, commander of the king of Aram\'s army, was healed of leprosy after dipping in the Jordan seven times on Elisha\'s instruction (2 Kings 5:14).', book: '2 Kings', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q070', question: 'Which prophet married a prostitute named Gomer as a living parable of Israel\'s unfaithfulness to God?', options: ['Amos', 'Hosea', 'Jonah', 'Micah'], correctAnswer: 'Hosea', explanation: 'God commanded Hosea to marry Gomer, a promiscuous woman, to dramatise Israel\'s spiritual adultery against the LORD (Hosea 1:2).', book: 'Hosea', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q071', question: 'Who was the high priest who anointed Solomon as king at the Gihon spring?', options: ['Abiathar', 'Ahimelech', 'Zadok', 'Eleazar'], correctAnswer: 'Zadok', explanation: 'Zadok the priest and Nathan the prophet anointed Solomon king at Gihon, and all the people shouted "Long live King Solomon!" (1 Kings 1:39).', book: '1 Kings', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q072', question: 'Who was the deaconess at Cenchreae commended by Paul in Romans 16?', options: ['Lydia', 'Priscilla', 'Junia', 'Phoebe'], correctAnswer: 'Phoebe', explanation: 'Paul commended Phoebe, a deacon of the church at Cenchreae, asking the Romans to receive her and help with whatever she needed (Romans 16:1–2).', book: 'Romans', testament: 'new', difficulty: 'hard', category: 'people' },
  { id: 'q073', question: 'Who was the first judge of Israel?', options: ['Gideon', 'Deborah', 'Ehud', 'Othniel'], correctAnswer: 'Othniel', explanation: 'Othniel son of Kenaz, Caleb\'s younger brother, was the first judge God raised to deliver Israel, from Cushan-Rishathaim of Aram (Judges 3:9).', book: 'Judges', testament: 'old', difficulty: 'hard', category: 'people' },
  { id: 'q074', question: 'Which sorcerer was struck blind by Paul in Paphos, Cyprus?', options: ['Simon Magus', 'Bar-Jesus (Elymas)', 'Sceva', 'Demetrius'], correctAnswer: 'Bar-Jesus (Elymas)', explanation: 'Paul struck Bar-Jesus, also called Elymas the sorcerer, with blindness for trying to turn the proconsul away from the faith (Acts 13:11).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'people' },
  { id: 'q075', question: 'Who was Paul\'s first European convert, a dealer in purple cloth?', options: ['Priscilla', 'Phoebe', 'Lydia', 'Damaris'], correctAnswer: 'Lydia', explanation: 'Lydia, a dealer in purple cloth from Thyatira, opened her heart to Paul\'s message in Philippi and was the first recorded European convert (Acts 16:14–15).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'people' },
  { id: 'q076', question: 'Who was the prophetess who recognised the infant Jesus in the temple and gave thanks to God?', options: ['Miriam', 'Deborah', 'Anna', 'Phoebe'], correctAnswer: 'Anna', explanation: 'Anna, an eighty-four-year-old prophetess who never left the temple, came up at that moment, gave thanks to God, and spoke about Jesus to all who were waiting for redemption (Luke 2:36–38).', book: 'Luke', testament: 'new', difficulty: 'hard', category: 'people' },

  // hard · places
  { id: 'q077', question: 'In which city did Paul have a night vision of a Macedonian man saying "Come over and help us"?', options: ['Corinth', 'Ephesus', 'Troas', 'Athens'], correctAnswer: 'Troas', explanation: 'During the night at Troas, Paul had a vision of a man from Macedonia urging him to cross over — the gospel\'s turning point into Europe (Acts 16:9).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'places' },
  { id: 'q078', question: 'Where was Paul born?', options: ['Jerusalem', 'Antioch', 'Tarsus', 'Corinth'], correctAnswer: 'Tarsus', explanation: 'Paul identified himself as "a Jew from Tarsus in Cilicia, a citizen of no ordinary city" (Acts 21:39).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'places' },
  { id: 'q079', question: 'What was the name of the pool with five colonnades in Jerusalem where Jesus healed a man who had been ill for thirty-eight years?', options: ['Pool of Siloam', 'Pool of Bethesda', 'King\'s Pool', 'Pool of Solomon'], correctAnswer: 'Pool of Bethesda', explanation: 'Near the Sheep Gate was a pool called Bethesda with five colonnades; Jesus healed a man there who had been an invalid for thirty-eight years (John 5:2–9).', book: 'John', testament: 'new', difficulty: 'hard', category: 'places' },
  { id: 'q080', question: 'At which mountain did God appear to Moses in the burning bush?', options: ['Mount Sinai', 'Mount Hermon', 'Mount Horeb', 'Mount Nebo'], correctAnswer: 'Mount Horeb', explanation: 'Moses was tending the flock near Horeb, the mountain of God, when the angel of the LORD appeared to him in a burning bush (Exodus 3:1–2). Horeb and Sinai refer to the same mountain range.', book: 'Exodus', testament: 'old', difficulty: 'hard', category: 'places' },
  { id: 'q081', question: 'In which city did Paul spend eighteen months teaching, founding one of the New Testament\'s most important churches?', options: ['Ephesus', 'Philippi', 'Corinth', 'Rome'], correctAnswer: 'Corinth', explanation: 'Paul stayed in Corinth for a year and six months, teaching the word of God — a vital Gentile church (Acts 18:11).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'places' },

  // hard · events
  { id: 'q082', question: 'What were the three gifts the Magi brought to the infant Jesus?', options: ['Gold, silver, myrrh', 'Gold, frankincense, myrrh', 'Frankincense, spices, silver', 'Gold, oil, myrrh'], correctAnswer: 'Gold, frankincense, myrrh', explanation: 'The Magi opened their treasures and presented him with gifts of gold, frankincense and myrrh (Matthew 2:11).', book: 'Matthew', testament: 'new', difficulty: 'hard', category: 'events' },
  { id: 'q083', question: 'What did Rahab hang from her window as the signal to spare her household when Israel attacked Jericho?', options: ['A white cloth', 'A scarlet cord', 'A burning torch', 'A bundle of hyssop'], correctAnswer: 'A scarlet cord', explanation: 'The spies told Rahab to tie a scarlet cord in her window as the sign so the Israelites would spare her household (Joshua 2:18).', book: 'Joshua', testament: 'old', difficulty: 'hard', category: 'events' },
  { id: 'q084', question: 'What weapon did the judge Shamgar use to kill six hundred Philistines?', options: ['A jawbone of a donkey', 'An oxgoad', 'A sling', 'A hammer'], correctAnswer: 'An oxgoad', explanation: 'Shamgar son of Anath struck down six hundred Philistines with an oxgoad — a sharpened stick used to drive cattle (Judges 3:31).', book: 'Judges', testament: 'old', difficulty: 'hard', category: 'events' },
  { id: 'q085', question: 'Why did Ananias and Sapphira both die suddenly in Acts 5?', options: ['They denied Jesus publicly', 'They lied to the Holy Spirit about the proceeds of land they sold', 'They refused to share food with the poor', 'They worshipped an idol in secret'], correctAnswer: 'They lied to the Holy Spirit about the proceeds of land they sold', explanation: 'Ananias kept back part of the money from the sale but pretended to give it all; Peter said he had lied to the Holy Spirit and he fell down dead. His wife did the same hours later (Acts 5:1–10).', book: 'Acts', testament: 'new', difficulty: 'hard', category: 'events' },
  { id: 'q086', question: 'What happened immediately after Jesus was baptised that confirmed his identity?', options: ['A mighty wind blew', 'An earthquake shook the ground', 'The heavens opened, the Spirit descended like a dove, and a voice said "This is my Son"', 'A pillar of fire appeared'], correctAnswer: 'The heavens opened, the Spirit descended like a dove, and a voice said "This is my Son"', explanation: 'As soon as Jesus was baptised, the heavens opened, the Spirit of God descended like a dove, and a voice from heaven said "This is my Son, whom I love; with him I am well pleased" (Matthew 3:16–17).', book: 'Matthew', testament: 'new', difficulty: 'hard', category: 'events' },
  { id: 'q087', question: 'What did King Hezekiah pray for that led God to add fifteen years to his life?', options: ['Victory in battle', 'Healing from a terminal illness', 'Wisdom to rule', 'A son to succeed him'], correctAnswer: 'Healing from a terminal illness', explanation: 'When Hezekiah was told he would die, he prayed and wept before God; Isaiah returned with the message that God had heard his prayer and would heal him and add fifteen years (2 Kings 20:1–6).', book: '2 Kings', testament: 'old', difficulty: 'hard', category: 'events' },

  // hard · numbers
  { id: 'q088', question: 'How many elders surround the throne of God in the Book of Revelation?', options: ['12', '24', '36', '144'], correctAnswer: '24', explanation: 'Surrounding the throne were twenty-four other thrones, and on them sat twenty-four elders dressed in white with golden crowns (Revelation 4:4).', book: 'Revelation', testament: 'new', difficulty: 'hard', category: 'numbers' },
  { id: 'q089', question: 'How many years did Methuselah live — the longest lifespan recorded in the Bible?', options: ['777', '880', '930', '969'], correctAnswer: '969', explanation: 'Methuselah lived nine hundred and sixty-nine years, the longest recorded lifespan in Scripture (Genesis 5:27).', book: 'Genesis', testament: 'old', difficulty: 'hard', category: 'numbers' },
  { id: 'q090', question: 'How many lepers did Jesus heal at once in Luke 17, with only one returning to give thanks?', options: ['5', '7', '10', '12'], correctAnswer: '10', explanation: 'Ten lepers cried out to Jesus for mercy; he healed all ten, but only one — a Samaritan — returned to give thanks (Luke 17:12–19).', book: 'Luke', testament: 'new', difficulty: 'hard', category: 'numbers' },
  { id: 'q091', question: 'How many chapters are in the Gospel of John?', options: ['16', '18', '21', '24'], correctAnswer: '21', explanation: 'The Gospel of John contains twenty-one chapters, ending with Jesus\' restoration of Peter and the note that the world could not contain all the books that could be written about Jesus.', book: 'John', testament: 'new', difficulty: 'hard', category: 'numbers' },
  { id: 'q092', question: 'How many silver coins did the woman in Jesus\' parable lose, causing her to search the whole house?', options: ['5', '7', '10', '12'], correctAnswer: '10', explanation: 'In Jesus\' parable a woman had ten silver coins, lost one, and swept the whole house until she found it — rejoicing with her neighbours (Luke 15:8–9).', book: 'Luke', testament: 'new', difficulty: 'hard', category: 'numbers' },

  // hard · verses
  { id: 'q093', question: 'Galatians 2:20 says "I have been crucified with Christ and I no longer live, but ___"', options: ['God who blesses me', 'the Spirit who guides me', 'Christ lives in me', 'the law empowers me'], correctAnswer: 'Christ lives in me', explanation: '"I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God" (Galatians 2:20).', book: 'Galatians', testament: 'new', difficulty: 'hard', category: 'verses' },
  { id: 'q094', question: 'Hebrews 11:1 defines faith as "confidence in what we hope for and ___"', options: ['certainty of what will come', 'trust in God\'s word', 'assurance about what we do not see', 'belief in the unseen God'], correctAnswer: 'assurance about what we do not see', explanation: '"Now faith is confidence in what we hope for and assurance about what we do not see" (Hebrews 11:1).', book: 'Hebrews', testament: 'new', difficulty: 'hard', category: 'verses' },
  { id: 'q095', question: 'In which Psalm does the messianic line "They pierced my hands and my feet" appear?', options: ['Psalm 2', 'Psalm 22', 'Psalm 51', 'Psalm 110'], correctAnswer: 'Psalm 22', explanation: 'Psalm 22:16 contains the prophetic description "they pierce my hands and my feet" — a striking anticipation of crucifixion.', book: 'Psalms', testament: 'old', difficulty: 'hard', category: 'verses' },
  { id: 'q096', question: 'What does Isaiah 53:5 say brought us peace and healing?', options: ['His prayers and tears', 'His life and teaching', 'His punishment and wounds', 'His death and burial'], correctAnswer: 'His punishment and wounds', explanation: '"But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed" (Isaiah 53:5).', book: 'Isaiah', testament: 'old', difficulty: 'hard', category: 'verses' },
  { id: 'q097', question: 'According to 2 Timothy 3:16, all Scripture is "God-breathed and is useful for teaching, rebuking, correcting and ___"', options: ['building up the church', 'growing in holiness', 'training in righteousness', 'walking in the Spirit'], correctAnswer: 'training in righteousness', explanation: '"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness" (2 Timothy 3:16).', book: '2 Timothy', testament: 'new', difficulty: 'hard', category: 'verses' },
  { id: 'q098', question: 'Lamentations 3:22–23 says God\'s compassions "never fail. They are new every morning; ___"', options: ['endless is his mercy', 'blessed is his name', 'great is your faithfulness', 'faithful is his love'], correctAnswer: 'great is your faithfulness', explanation: '"Because of the LORD\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness" (Lamentations 3:22–23).', book: 'Lamentations', testament: 'old', difficulty: 'hard', category: 'verses' },
  { id: 'q099', question: 'Romans 6:23 contrasts "the wages of sin is death" with "the gift of God is ___"', options: ['salvation through faith', 'forgiveness of sins', 'peace with God always', 'eternal life in Christ Jesus our Lord'], correctAnswer: 'eternal life in Christ Jesus our Lord', explanation: '"For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord" (Romans 6:23).', book: 'Romans', testament: 'new', difficulty: 'hard', category: 'verses' },
  { id: 'q100', question: 'What does Deuteronomy 6:5 — the heart of the Shema — command Israel to do?', options: ['Obey the law completely', 'Love the LORD your God with all your heart, soul, and strength', 'Teach your children to pray daily', 'Remember the Sabbath and keep it holy'], correctAnswer: 'Love the LORD your God with all your heart, soul, and strength', explanation: '"Love the LORD your God with all your heart and with all your soul and with all your strength" (Deuteronomy 6:5). Jesus called this the greatest commandment.', book: 'Deuteronomy', testament: 'old', difficulty: 'hard', category: 'verses' },
]

export const VERSE_QUESTIONS: VerseQuestion[] = [
  {
    id: 'vq01',
    reference: 'John 3:16',
    verseBefore: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but',
    missingWords: ['have eternal life'],
    options: ['live forever in peace', 'have eternal life', 'be counted righteous', 'receive great blessing'],
    correctAnswer: 'have eternal life',
    fullVerse: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    explanation: 'John 3:16 summarises the entire gospel: God\'s love, Christ\'s sacrifice, and the gift of eternal life through faith.',
    difficulty: 'easy',
  },
  {
    id: 'vq02',
    reference: 'Psalm 23:1',
    verseBefore: 'The LORD is my',
    missingWords: ['shepherd, I lack nothing'],
    options: ['rock and my fortress', 'light and my salvation', 'shepherd, I lack nothing', 'strength and my song'],
    correctAnswer: 'shepherd, I lack nothing',
    fullVerse: 'The LORD is my shepherd, I lack nothing.',
    explanation: 'Psalm 23, written by David, opens by picturing God as a shepherd who provides everything his flock needs.',
    difficulty: 'easy',
  },
  {
    id: 'vq03',
    reference: 'Romans 8:28',
    verseBefore: 'And we know that in all things God works for the good of those who love him, who have been called',
    missingWords: ['according to his purpose'],
    options: ['to follow his ways', 'to eternal salvation', 'according to his purpose', 'by his great love'],
    correctAnswer: 'according to his purpose',
    fullVerse: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    explanation: 'Paul assures believers that even suffering fits into God\'s sovereign plan for those he has called.',
    difficulty: 'easy',
  },
  {
    id: 'vq04',
    reference: 'Philippians 4:13',
    verseBefore: 'I can do all this through',
    missingWords: ['him who gives me strength'],
    options: ['God who empowers me', 'faith that sustains me', 'the Spirit within me', 'him who gives me strength'],
    correctAnswer: 'him who gives me strength',
    fullVerse: 'I can do all this through him who gives me strength.',
    explanation: 'Written from prison, Paul declares that contentment in every circumstance is possible through Christ\'s empowering presence.',
    difficulty: 'easy',
  },
  {
    id: 'vq05',
    reference: 'Proverbs 3:5-6',
    verseBefore: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will',
    missingWords: ['make your paths straight'],
    options: ['grant you wisdom', 'bless all your works', 'make your paths straight', 'give you his peace'],
    correctAnswer: 'make your paths straight',
    fullVerse: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    explanation: 'Solomon calls for complete trust in God rather than self-reliance, promising divine guidance in return.',
    difficulty: 'easy',
  },
  {
    id: 'vq06',
    reference: 'Isaiah 40:31',
    verseBefore: 'but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and',
    missingWords: ['not be faint'],
    options: ['never stumble', 'not be faint', 'not grow tired', 'never fall'],
    correctAnswer: 'not be faint',
    fullVerse: 'but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    explanation: 'Isaiah promises that waiting on God renews strength — the imagery of eagles soaring speaks of effortless divine empowerment.',
    difficulty: 'easy',
  },
  {
    id: 'vq07',
    reference: 'Jeremiah 29:11',
    verseBefore: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you',
    missingWords: ['hope and a future'],
    options: ['peace and security', 'joy and purpose', 'hope and a future', 'wisdom and strength'],
    correctAnswer: 'hope and a future',
    fullVerse: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    explanation: 'God spoke these words to Israel in Babylonian exile — a promise that his purposeful plans outlast even the worst circumstances.',
    difficulty: 'easy',
  },
  {
    id: 'vq08',
    reference: 'Hebrews 11:1',
    verseBefore: 'Now faith is confidence in what we hope for and',
    missingWords: ['assurance about what we do not see'],
    options: ['certainty of God\'s promises', 'belief in the unseen God', 'trust beyond all doubt', 'assurance about what we do not see'],
    correctAnswer: 'assurance about what we do not see',
    fullVerse: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    explanation: 'The writer of Hebrews defines faith at the start of the great "hall of faith" chapter, where heroes trusted God for what was not yet visible.',
    difficulty: 'medium',
  },
  {
    id: 'vq09',
    reference: 'John 14:6',
    verseBefore: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father',
    missingWords: ['except through me'],
    options: ['but by my word', 'without my blessing', 'except through me', 'unless I allow it'],
    correctAnswer: 'except through me',
    fullVerse: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
    explanation: 'Jesus\' "I AM" statement to Thomas declares his exclusive role as the only path to God the Father.',
    difficulty: 'easy',
  },
  {
    id: 'vq10',
    reference: 'Matthew 28:19',
    verseBefore: 'Therefore go and make disciples of all nations, baptising them in the name of the Father and of the Son and of',
    missingWords: ['the Holy Spirit'],
    options: ['the Living God', 'all the angels', 'the Holy Spirit', 'the Church'],
    correctAnswer: 'the Holy Spirit',
    fullVerse: 'Therefore go and make disciples of all nations, baptising them in the name of the Father and of the Son and of the Holy Spirit.',
    explanation: 'The Great Commission commands the church to make disciples worldwide and baptise them in the Trinitarian name.',
    difficulty: 'easy',
  },
  {
    id: 'vq11',
    reference: '1 Corinthians 13:4',
    verseBefore: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonour others, it is not self-seeking, it is not easily angered, it',
    missingWords: ['keeps no record of wrongs'],
    options: ['forgives all offences', 'overlooks every sin', 'bears every insult', 'keeps no record of wrongs'],
    correctAnswer: 'keeps no record of wrongs',
    fullVerse: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonour others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
    explanation: 'Paul\'s description of love in 1 Corinthians 13 — often called the "love chapter" — describes the character of genuine, Christ-like love.',
    difficulty: 'medium',
  },
  {
    id: 'vq12',
    reference: 'James 1:2',
    verseBefore: 'Consider it pure joy, my brothers and sisters, whenever you face',
    missingWords: ['trials of many kinds'],
    options: ['troubles in life', 'times of suffering', 'trials of many kinds', 'seasons of pain'],
    correctAnswer: 'trials of many kinds',
    fullVerse: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds.',
    explanation: 'James calls believers to a counterintuitive response to hardship — joy — because trials produce perseverance and mature faith.',
    difficulty: 'medium',
  },
  {
    id: 'vq13',
    reference: 'Romans 12:2',
    verseBefore: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is — his good,',
    missingWords: ['pleasing and perfect will'],
    options: ['holy and righteous will', 'eternal and sure will', 'pleasing and perfect will', 'gracious and pure will'],
    correctAnswer: 'pleasing and perfect will',
    fullVerse: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is — his good, pleasing and perfect will.',
    explanation: 'Paul calls believers to mental and spiritual transformation rather than cultural conformity, enabling discernment of God\'s will.',
    difficulty: 'medium',
  },
  {
    id: 'vq14',
    reference: 'Ephesians 2:8-9',
    verseBefore: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works,',
    missingWords: ['so that no one can boast'],
    options: ['as all men know', 'lest any man glory', 'for works cannot save', 'so that no one can boast'],
    correctAnswer: 'so that no one can boast',
    fullVerse: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.',
    explanation: 'Paul makes clear that salvation is entirely God\'s gracious gift received through faith, ruling out any human merit or boasting.',
    difficulty: 'medium',
  },
  {
    id: 'vq15',
    reference: 'Genesis 1:1',
    verseBefore: 'In the beginning God created',
    missingWords: ['the heavens and the earth'],
    options: ['the sky and the seas', 'light and darkness', 'the heavens and the earth', 'all living things'],
    correctAnswer: 'the heavens and the earth',
    fullVerse: 'In the beginning God created the heavens and the earth.',
    explanation: 'The Bible\'s opening verse establishes God as the creator of everything that exists — the foundation for all that follows.',
    difficulty: 'easy',
  },
  {
    id: 'vq16',
    reference: 'Psalm 119:105',
    verseBefore: 'Your word is a lamp for my feet,',
    missingWords: ['a light on my path'],
    options: ['a shield for my heart', 'a guide for my soul', 'a light on my path', 'a strength in my weakness'],
    correctAnswer: 'a light on my path',
    fullVerse: 'Your word is a lamp for my feet, a light on my path.',
    explanation: 'The psalmist pictures God\'s word as the only reliable light for navigating life\'s journey — illuminating the path step by step.',
    difficulty: 'easy',
  },
  {
    id: 'vq17',
    reference: 'Matthew 6:33',
    verseBefore: 'But seek first his kingdom and his righteousness, and all these things will be',
    missingWords: ['given to you as well'],
    options: ['added to your life', 'provided for you', 'yours in abundance', 'given to you as well'],
    correctAnswer: 'given to you as well',
    fullVerse: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    explanation: 'Jesus promises that those who make God\'s kingdom their first priority will find that their practical needs are also taken care of.',
    difficulty: 'medium',
  },
  {
    id: 'vq18',
    reference: 'Romans 3:23',
    verseBefore: 'for all have sinned and fall short of the',
    missingWords: ['glory of God'],
    options: ['holiness of God', 'kingdom of God', 'righteousness of God', 'glory of God'],
    correctAnswer: 'glory of God',
    fullVerse: 'for all have sinned and fall short of the glory of God.',
    explanation: 'Romans 3:23 states the universal human condition of sin, establishing why everyone needs the redemption Paul describes next.',
    difficulty: 'easy',
  },
  {
    id: 'vq19',
    reference: 'John 11:35',
    verseBefore: '',
    missingWords: ['Jesus wept'],
    options: ['Jesus prayed aloud', 'Jesus wept', 'Jesus was troubled', 'Jesus stood still'],
    correctAnswer: 'Jesus wept',
    fullVerse: 'Jesus wept.',
    explanation: 'Standing at Lazarus\' tomb, Jesus wept with Mary and the mourners — revealing both his genuine humanity and his compassion.',
    difficulty: 'easy',
  },
  {
    id: 'vq20',
    reference: 'Revelation 21:4',
    verseBefore: '"He will wipe every tear from their eyes. There will be no more death" or mourning or crying or pain, for the old order of things',
    missingWords: ['has passed away'],
    options: ['will be no more', 'is finished forever', 'shall end at last', 'has passed away'],
    correctAnswer: 'has passed away',
    fullVerse: '"He will wipe every tear from their eyes. There will be no more death" or mourning or crying or pain, for the old order of things has passed away.',
    explanation: 'John\'s vision of the new creation promises God\'s personal, permanent removal of every source of suffering — the ultimate hope of Scripture.',
    difficulty: 'medium',
  },
]

export const TIMELINE_QUESTIONS: TimelineQuestion[] = [
  {
    id: 'tq01',
    difficulty: 'easy',
    events: [
      { id: 'tq01a', event: 'God creates the world', description: 'God creates the heavens, earth, light, sky, land, plants, sun, moon, animals, and humanity in six days', order: 1, period: 'Creation', reference: 'Genesis 1' },
      { id: 'tq01b', event: 'Adam and Eve disobey God', description: 'Adam and Eve eat the forbidden fruit and are expelled from the Garden of Eden', order: 2, period: 'Creation', reference: 'Genesis 3' },
      { id: 'tq01c', event: 'Noah\'s flood covers the earth', description: 'God sends a worldwide flood; Noah, his family, and the animals are saved in the ark', order: 3, period: 'Early History', reference: 'Genesis 7' },
      { id: 'tq01d', event: 'God scatters people at Babel', description: 'God confuses the languages of those building the Tower of Babel and scatters them across the earth', order: 4, period: 'Early History', reference: 'Genesis 11' },
    ],
  },
  {
    id: 'tq02',
    difficulty: 'easy',
    events: [
      { id: 'tq02a', event: 'God calls Abraham to leave Haran', description: 'God tells Abram to leave his homeland and go to a land he will be shown, promising to make him a great nation', order: 1, period: 'Patriarchs', reference: 'Genesis 12' },
      { id: 'tq02b', event: 'Isaac is born to Abraham and Sarah', description: 'God fulfils his promise; Sarah gives birth to Isaac in her old age', order: 2, period: 'Patriarchs', reference: 'Genesis 21' },
      { id: 'tq02c', event: 'Jacob and Esau are born', description: 'Rebekah gives birth to twin boys; Esau the elder and Jacob the younger', order: 3, period: 'Patriarchs', reference: 'Genesis 25' },
      { id: 'tq02d', event: 'Joseph is sold into slavery in Egypt', description: 'Joseph\'s jealous brothers sell him to Ishmaelite traders heading to Egypt for twenty pieces of silver', order: 4, period: 'Patriarchs', reference: 'Genesis 37' },
    ],
  },
  {
    id: 'tq03',
    difficulty: 'easy',
    events: [
      { id: 'tq03a', event: 'God speaks to Moses at the burning bush', description: 'Moses encounters a bush that burns but is not consumed; God calls him to lead Israel out of Egypt', order: 1, period: 'Exodus', reference: 'Exodus 3' },
      { id: 'tq03b', event: 'God sends ten plagues on Egypt', description: 'God strikes Egypt with ten devastating plagues to break Pharaoh\'s resistance', order: 2, period: 'Exodus', reference: 'Exodus 7–12' },
      { id: 'tq03c', event: 'Israel crosses the Red Sea', description: 'Moses parts the Red Sea; Israel crosses on dry ground while Pharaoh\'s army is drowned', order: 3, period: 'Exodus', reference: 'Exodus 14' },
      { id: 'tq03d', event: 'God gives the Ten Commandments at Sinai', description: 'God appears on Mount Sinai and gives Moses the law written on two stone tablets', order: 4, period: 'Wilderness', reference: 'Exodus 20' },
    ],
  },
  {
    id: 'tq04',
    difficulty: 'medium',
    events: [
      { id: 'tq04a', event: 'Twelve spies are sent into Canaan', description: 'Moses sends one leader from each tribe to explore the Promised Land; ten give a fearful report', order: 1, period: 'Wilderness', reference: 'Numbers 13' },
      { id: 'tq04b', event: 'Israel wanders forty years in the wilderness', description: 'Because of Israel\'s unbelief, God sentences that generation to wander until they die in the desert', order: 2, period: 'Wilderness', reference: 'Numbers 14' },
      { id: 'tq04c', event: 'Joshua leads Israel across the Jordan', description: 'The Jordan River parts and Israel enters the Promised Land under Joshua\'s leadership', order: 3, period: 'Conquest', reference: 'Joshua 3' },
      { id: 'tq04d', event: 'The walls of Jericho collapse', description: 'After marching around the city for seven days and blowing trumpets, the walls of Jericho fall flat', order: 4, period: 'Conquest', reference: 'Joshua 6' },
    ],
  },
  {
    id: 'tq05',
    difficulty: 'medium',
    events: [
      { id: 'tq05a', event: 'Saul is anointed as Israel\'s first king', description: 'Samuel anoints Saul from the tribe of Benjamin as king at Mizpah', order: 1, period: 'Monarchy', reference: '1 Samuel 10' },
      { id: 'tq05b', event: 'David kills Goliath', description: 'The young shepherd David kills the Philistine giant Goliath with a stone from his sling', order: 2, period: 'Monarchy', reference: '1 Samuel 17' },
      { id: 'tq05c', event: 'David is crowned king over all Israel', description: 'After Saul\'s death, all the tribes come to David at Hebron and anoint him king', order: 3, period: 'Monarchy', reference: '2 Samuel 5' },
      { id: 'tq05d', event: 'Solomon builds the temple in Jerusalem', description: 'King Solomon completes the magnificent temple in Jerusalem and the glory of God fills the house', order: 4, period: 'Monarchy', reference: '1 Kings 6–8' },
    ],
  },
  {
    id: 'tq06',
    difficulty: 'medium',
    events: [
      { id: 'tq06a', event: 'The kingdom splits into Israel and Judah', description: 'After Solomon\'s death his son Rehoboam rules harshly; ten northern tribes rebel and form the kingdom of Israel', order: 1, period: 'Divided Kingdom', reference: '1 Kings 12' },
      { id: 'tq06b', event: 'Elijah defeats the prophets of Baal on Mount Carmel', description: 'Elijah calls down fire from heaven, proving the LORD is God and executing the 450 prophets of Baal', order: 2, period: 'Divided Kingdom', reference: '1 Kings 18' },
      { id: 'tq06c', event: 'Assyria conquers the northern kingdom', description: 'Assyria destroys Samaria and exiles the ten northern tribes — the "lost tribes" of Israel', order: 3, period: 'Divided Kingdom', reference: '2 Kings 17' },
      { id: 'tq06d', event: 'Babylon destroys Jerusalem and the temple', description: 'Nebuchadnezzar burns the temple, demolishes Jerusalem\'s walls, and deports Judah to Babylon', order: 4, period: 'Exile', reference: '2 Kings 25' },
    ],
  },
  {
    id: 'tq07',
    difficulty: 'medium',
    events: [
      { id: 'tq07a', event: 'Daniel and friends taken to Babylon', description: 'Nebuchadnezzar selects young Israelite nobles including Daniel, Hananiah, Mishael, and Azariah for training', order: 1, period: 'Exile', reference: 'Daniel 1' },
      { id: 'tq07b', event: 'Three friends survive the fiery furnace', description: 'Shadrach, Meshach, and Abednego refuse to worship the golden image and are thrown into a furnace — and survive', order: 2, period: 'Exile', reference: 'Daniel 3' },
      { id: 'tq07c', event: 'Daniel interprets the writing on the wall', description: 'A hand writes on Belshazzar\'s palace wall during a feast; Daniel reads the message of coming doom', order: 3, period: 'Exile', reference: 'Daniel 5' },
      { id: 'tq07d', event: 'Daniel is protected in the lions\' den', description: 'Daniel is thrown to lions for praying to God rather than the king; God shuts the lions\' mouths', order: 4, period: 'Exile', reference: 'Daniel 6' },
    ],
  },
  {
    id: 'tq08',
    difficulty: 'easy',
    events: [
      { id: 'tq08a', event: 'Jesus is born in Bethlehem', description: 'Mary gives birth to Jesus in a stable; angels announce the news to shepherds nearby', order: 1, period: 'Life of Christ', reference: 'Luke 2' },
      { id: 'tq08b', event: 'Jesus is baptised by John in the Jordan', description: 'Jesus comes from Galilee to be baptised; the Spirit descends like a dove and God speaks from heaven', order: 2, period: 'Life of Christ', reference: 'Matthew 3' },
      { id: 'tq08c', event: 'Jesus is tempted in the wilderness', description: 'The Spirit leads Jesus into the wilderness for forty days where the devil tests him three times', order: 3, period: 'Life of Christ', reference: 'Matthew 4' },
      { id: 'tq08d', event: 'Jesus delivers the Sermon on the Mount', description: 'Jesus teaches the crowds the Beatitudes and foundational principles of kingdom living', order: 4, period: 'Life of Christ', reference: 'Matthew 5–7' },
    ],
  },
  {
    id: 'tq09',
    difficulty: 'easy',
    events: [
      { id: 'tq09a', event: 'Jesus enters Jerusalem on a donkey', description: 'The crowd spreads cloaks and palm branches, shouting "Hosanna!" as Jesus rides into Jerusalem', order: 1, period: 'Passion Week', reference: 'Matthew 21' },
      { id: 'tq09b', event: 'Jesus shares the Last Supper with his disciples', description: 'Jesus eats the Passover meal with his twelve disciples and institutes the Lord\'s Supper', order: 2, period: 'Passion Week', reference: 'Matthew 26' },
      { id: 'tq09c', event: 'Jesus is crucified at Golgotha', description: 'Jesus is nailed to a cross between two criminals on the hill called the Place of the Skull', order: 3, period: 'Passion Week', reference: 'John 19' },
      { id: 'tq09d', event: 'Jesus rises from the dead on the third day', description: 'The stone is rolled away; Jesus appears first to Mary Magdalene, then to the disciples', order: 4, period: 'Passion Week', reference: 'John 20' },
    ],
  },
  {
    id: 'tq10',
    difficulty: 'medium',
    events: [
      { id: 'tq10a', event: 'Jesus ascends to heaven', description: 'Forty days after the resurrection Jesus ascends from the Mount of Olives; two angels promise he will return', order: 1, period: 'Early Church', reference: 'Acts 1' },
      { id: 'tq10b', event: 'The Holy Spirit comes at Pentecost', description: 'A rushing wind and tongues of fire fill the disciples; Peter preaches and three thousand people believe', order: 2, period: 'Early Church', reference: 'Acts 2' },
      { id: 'tq10c', event: 'Stephen is stoned — the church scatters', description: 'Stephen becomes the first martyr; persecution scatters believers from Jerusalem, spreading the gospel', order: 3, period: 'Early Church', reference: 'Acts 7–8' },
      { id: 'tq10d', event: 'Saul is converted on the road to Damascus', description: 'Blinded by a light from heaven, Saul hears the risen Jesus and is transformed into the apostle Paul', order: 4, period: 'Early Church', reference: 'Acts 9' },
    ],
  },
]

function qs(...ids: string[]): BibleQuestion[] {
  return ids
    .map(id => BIBLE_QUESTIONS.find(q => q.id === id))
    .filter((q): q is BibleQuestion => Boolean(q))
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    theme: 'In the Beginning',
    description: 'Creation, the Fall, the flood, and Babel — the opening chapters of Genesis.',
    questions: qs('q001','q002','q003','q012','q016','q020','q025','q047','q067','q089'),
  },
  {
    theme: 'The Patriarchs',
    description: 'Abraham, Isaac, Jacob, Joseph, and the founding story of the Hebrew people.',
    questions: qs('q001','q003','q012','q025','q033','q035','q047','q067','q089','q020'),
  },
  {
    theme: 'Moses and Exodus',
    description: 'The burning bush, ten plagues, the Red Sea crossing, and the law at Sinai.',
    questions: qs('q004','q013','q014','q019','q023','q055','q080','q100','q043','q083'),
  },
  {
    theme: 'The Judges',
    description: 'Gideon, Samson, Deborah, and the cycles of Israel\'s deliverance before the kings.',
    questions: qs('q034','q048','q056','q073','q084','q033','q005','q006','q031','q043'),
  },
  {
    theme: 'King David',
    description: 'Israel\'s greatest king — shepherd, giant-slayer, psalmist, and man after God\'s heart.',
    questions: qs('q005','q006','q031','q032','q028','q044','q051','q057','q071','q095'),
  },
  {
    theme: 'Solomon',
    description: 'The wisest king, the temple builder, and the writer of Proverbs.',
    questions: qs('q029','q044','q066','q071','q028','q057','q095','q021','q022','q060'),
  },
  {
    theme: 'The Prophets',
    description: 'Isaiah, Jeremiah, Daniel, Hosea, Amos, Micah — voices of God across the centuries.',
    questions: qs('q054','q063','q064','q065','q068','q070','q087','q096','q098','q039'),
  },
  {
    theme: 'Life of Jesus',
    description: 'The birth, baptism, temptation, ministry, and passion of Jesus Christ.',
    questions: qs('q007','q008','q009','q010','q011','q015','q018','q046','q053','q086'),
  },
  {
    theme: 'Miracles of Jesus',
    description: 'Water into wine, healing the sick, raising the dead — signs that revealed Jesus as the Son of God.',
    questions: qs('q017','q026','q036','q040','q052','q058','q079','q082','q090','q092'),
  },
  {
    theme: 'The Parables',
    description: 'The lost coin, the prodigal son, the good Samaritan — stories Jesus told about the kingdom.',
    questions: qs('q010','q024','q030','q036','q049','q058','q076','q090','q092','q053'),
  },
  {
    theme: 'The Apostles',
    description: 'Pentecost, Stephen, Paul\'s conversion, and the explosive spread of the early church.',
    questions: qs('q038','q041','q045','q050','q059','q074','q075','q077','q078','q081'),
  },
  {
    theme: "Paul's Letters",
    description: 'Romans, Philippians, Galatians, Hebrews — the theology that shaped Christian doctrine.',
    questions: qs('q061','q062','q072','q093','q094','q097','q099','q085','q041','q059'),
  },
  {
    theme: 'The Psalms',
    description: 'The hymn book of the Bible — prayers, praise, lament, and prophecy in poetry.',
    questions: qs('q028','q057','q095','q029','q066','q064','q065','q096','q098','q063'),
  },
  {
    theme: 'Proverbs and Wisdom',
    description: 'Practical wisdom for everyday life from Proverbs, the Psalms, and the sages of Israel.',
    questions: qs('q029','q066','q028','q057','q095','q021','q022','q060','q025','q047'),
  },
  {
    theme: 'Revelation',
    description: 'The letters to the seven churches, the throne room, and the vision of the new creation.',
    questions: qs('q042','q088','q037','q040','q052','q079','q026','q027','q017','q091'),
  },
]

export function getRandomQuestions(
  count: number,
  difficulty: import('../types/bible').BibleDifficulty,
  testament: import('../types/bible').Testament,
): import('../types/bible').BibleQuestion[] {
  return BIBLE_QUESTIONS
    .filter(q =>
      (difficulty === q.difficulty || true) &&
      (testament === 'both' ||
        q.testament === testament ||
        q.testament === 'both'))
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

export function getDailyChallenge(): DailyChallenge {
  const day = new Date().getDate() - 1
  return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length]
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}
