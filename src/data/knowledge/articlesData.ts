import { AyurvedicArticle } from "@/types/knowledge";

export const articlesData: AyurvedicArticle[] = [
  // ==================== FUNDAMENTALS ====================
  {
    id: "foundations-of-ayurveda",
    title: "Foundations of Ayurveda: The Science of Longevity and Elemental Balance",
    subtitle: "Understanding the 5,000-year-old healing tradition and the five Mahabhutas.",
    category: "fundamentals",
    readTime: "7 min read",
    targetDosha: "all",
    summary: "An introduction to Ayurveda ('Ayu' = life, 'Veda' = knowledge), its ancient roots in the Vedic traditions of India, and how the five primordial elements construct human physiology and consciousness.",
    sections: [
      {
        heading: "What is Ayurveda?",
        content: "Ayurveda, originating in the Indian subcontinent more than five millennia ago, is recognized as the world's most enduring holistic system of healthcare. Rather than regarding the body as a collection of isolated organs or viewing health merely as the absence of detectable disease, classical Ayurveda defines true health (Swastha) as an integrated harmony: balanced doshas (functional bio-energies), balanced agni (digestive fires), healthy dhatus (bodily tissues), proper elimination of malas (metabolic wastes), and a delighted, peaceful mind, senses, and spirit.",
      },
      {
        heading: "The Five Great Elements (Pancha Mahabhutas)",
        content: "Central to Ayurvedic cosmology is the macrocosm-microcosm principle: whatever exists in the vast universe is reflected within the individual human organism. The entire material universe is composed of five elemental states of matter and energy:",
        bulletPoints: [
          "Akasha (Space / Ether): The field of non-resistance, expansiveness, and sound. Within the body, it constitutes bodily cavities (mouth, thorax, intestines, cellular pores).",
          "Vayu (Air): The principle of movement, kinetic energy, and circulation. Within the body, it directs nerve impulses, respiration, peristalsis, and muscular contractions.",
          "Tejas / Agni (Fire): The principle of transformation, heat, and illumination. Within the body, it governs cellular metabolism, digestive enzymes, vision, and mental comprehension.",
          "Jala / Aap (Water): The principle of fluidity, cohesion, and hydration. Within the body, it constitutes plasma, intracellular fluid, cerebrospinal fluid, and mucous secretions.",
          "Prithvi (Earth): The principle of structure, density, stability, and mass. Within the body, it provides the solid foundation of bones, teeth, muscles, and tendons.",
        ],
      },
      {
        heading: "From Five Elements to Three Doshas",
        content: "Because the five elements are too subtle to govern biological processes directly, they combine in pairs to form the three functional bio-energies known as the Doshas: Space and Air combine to form Vata (the energy of movement); Fire and Water combine to form Pitta (the energy of transformation); Water and Earth combine to form Kapha (the energy of structure and lubrication). Every human being possesses all three doshas in a unique, lifelong ratio established at conception.",
      },
    ],
    classicalReferences: [
      "Charaka Samhita Sutrasthana 1/41: 'Mind, soul and body — this trinity like a tripod sustains the world.'",
      "Sushruta Samhita Sutrasthana 15/41: 'He whose doshas, agni, tissues, and waste eliminations are balanced, and whose senses, mind and soul are serene, is called a healthy person (Swastha).'",
    ],
    modernContextNote: "Contemporary systems biology increasingly validates this network-based perspective, viewing human physiology as a non-linear, dynamic ecosystem rather than a purely mechanical clockwork system.",
    tags: ["Ayurveda Basics", "Five Elements", "Pancha Mahabhutas", "Philosophy of Health"],
    featured: true,
  },
  {
    id: "prakriti-vs-vikriti",
    title: "Prakriti versus Vikriti: Your Genetic Blueprint vs. Current Imbalance",
    subtitle: "Why identifying your baseline constitution is essential for personalized wellbeing.",
    category: "fundamentals",
    readTime: "6 min read",
    targetDosha: "all",
    summary: "Understand the vital distinction between your unchangeable inborn constitutional baseline (Prakriti) and your temporary, acquired state of imbalance (Vikriti).",
    sections: [
      {
        heading: "What is Prakriti?",
        content: "Prakriti represents your original genetic and energetic constitution, established at the exact moment of conception based on parental genetics, seasonal factors, maternal nutrition, and ancestral lineage. Prakriti remains constant throughout your life, determining your natural bone structure, skin tendency, eye shape, metabolic tempo, and baseline psychological inclinations.",
      },
      {
        heading: "What is Vikriti?",
        content: "Vikriti represents your current state of deviation or imbalance—how your doshas are functioning today in response to stress, irregular sleep, seasonal weather, poor diet, travel, emotional turmoil, or illness. While Prakriti is your personal baseline of balance, Vikriti is what causes symptoms, disease, or discomfort.",
      },
      {
        heading: "The Golden Rule of Ayurvedic Treatment",
        content: "When selecting daily diet, herbs, and lifestyle practices, Ayurveda prioritizes pacifying the current Vikriti (the aggravated dosha causing symptoms) before adjusting to support long-term Prakriti. For instance, if a naturally Pitta-dominant person travels extensively, becomes dehydrated, and experiences insomnia and constipation, they are presenting with a Vata Vikriti. In this state, they must first embrace warm, grounding Vata therapies to restore balance before returning to their baseline Pitta cooling diet.",
      },
    ],
    classicalReferences: [
      "Charaka Samhita Vimanasthana 8/95-100: Detailed classification of constitutional types according to doshic dominance at birth.",
      "Ashtanga Hridaya Sutrasthana 1/9-10: On the origin and diagnosis of Prakriti and Vikriti.",
    ],
    modernContextNote: "Prakriti corresponds closely to genetic baseline and epigenetics, while Vikriti represents phenotypical gene expression and metabolomic fluctuations influenced by environment and lifestyle.",
    tags: ["Prakriti", "Vikriti", "Personalization", "Assessment", "Dosha Balance"],
    featured: true,
  },
  {
    id: "understanding-agni-and-ama",
    title: "The Engine of Vitality: Understanding Agni (Digestive Fire) and Ama (Metabolic Toxins)",
    subtitle: "Why classical Ayurveda asserts that all chronic disease originates in impaired digestion.",
    category: "digestion",
    readTime: "8 min read",
    targetDosha: "all",
    summary: "A deep dive into the 13 physiological fires of the body (Agni), the stages of toxic intermediate waste accumulation (Ama), and practical steps to restore metabolic brilliance.",
    sections: [
      {
        heading: "The Centrality of Agni",
        content: "In classical Ayurveda, Agni (the internal biological fire) is the supreme arbiter of health, immunity, radiance, and longevity. Charaka Samhita states: 'When Agni is extinguished, the person dies; when Agni burns normally, the person lives a long, healthy life; when Agni is impaired, the person becomes diseased.' Agni is not confined to stomach acid; it encompasses all enzymatic, endocrine, and metabolic processes across every tissue.",
      },
      {
        heading: "The Thirteen Agnis",
        content: "Ayurveda recognizes 13 distinct types of Agni in human physiology:",
        bulletPoints: [
          "Jatharagni: The primary master digestive fire located in the stomach and duodenum, responsible for breaking down food into nutrient essence (Ahara Rasa).",
          "Five Bhutagnis: Located in the liver, these transform the elemental qualities of digested food to nourish the five elemental components of the body (Space, Air, Fire, Water, Earth).",
          "Seven Dhatwagnis: Cellular metabolic fires operating within each of the seven bodily tissues (Rasa, Rakta, Mamsa, Medas, Asthi, Majja, Shukra) to synthesize healthy cells.",
        ],
      },
      {
        heading: "What is Ama?",
        content: "When Jatharagni is weak (Manda) or erratic (Vishama), food is not completely digested or assimilated. This undigested, fermenting, sticky substance is called Ama. Ama acts as an antigenic toxin: it clogs the microcirculatory channels (Srotas), adheres to cellular membranes, impairs lymphatic drainage, and triggers immune dysregulation.",
      },
      {
        heading: "Clinical Signs of Ama Accumulation",
        content: "Key physical signs indicating that Ama is circulating in your system include:",
        bulletPoints: [
          "A thick white, grayish, or yellowish coating on the surface of the tongue in the morning",
          "Heavy morning lethargy, waking up feeling exhausted despite 8 hours of sleep",
          "Brain fog, dull intellect, and lack of enthusiasm",
          "Foul breath, bad body odor, or heavy, foul-smelling stool that sinks or sticks to the toilet bowl",
          "General bodily stiffness, aching joints, and loss of natural taste perception",
        ],
      },
    ],
    classicalReferences: [
      "Charaka Samhita Chikitsasthana 15/3-4: 'Life, complexion, strength, health, enthusiasm, growth, luster, ojas, and prana are all dependent on Agni.'",
      "Ashtanga Hridaya Sutrasthana 13/23-26: Etiology, characteristics, and pathologies of Ama.",
    ],
    modernContextNote: "Ama correlates closely with modern concepts of intestinal permeability ('leaky gut'), circulating bacterial endotoxins (LPS), advanced glycation end-products (AGEs), and chronic low-grade systemic inflammation.",
    tags: ["Agni", "Ama", "Metabolism", "Gut Health", "Detoxification"],
    featured: true,
  },
  {
    id: "ahara-vidhi-dietary-rules",
    title: "Ahara Vidhi: The Twelve Classical Rules of Mindful Ayurvedic Eating",
    subtitle: "Why the context, speed, and mental state during meals are just as critical as the ingredients.",
    category: "nutrition",
    readTime: "7 min read",
    targetDosha: "all",
    summary: "Explore Charaka Samhita's timeless guidelines for meal consumption, from food temperature and mindful chewing to posture and digestive pacing.",
    sections: [
      {
        heading: "Diet Beyond Calories",
        content: "In Charaka Samhita Sutrasthana Chapter 28, the sage explains that even the most wholesome and organic food becomes toxic if consumed in the wrong psychological state, at the wrong time, or with poor digestive posture. Eating is considered a sacred Yajna (fire offering), where nutrients are offered to the divine inner fire (Jatharagni).",
      },
      {
        heading: "The Essential Rules of Ahara Vidhi",
        content: "The classical texts outline twelve core practices for honoring digestion:",
        bulletPoints: [
          "Ushnam Ashniyat (Eat Warm Food): Food should be freshly cooked and warm. Warmth stimulates salivary enzymes, increases blood flow to the gut, and ensures smooth peristalsis.",
          "Snigdham Ashniyat (Eat Unctuous Food): Food should contain healthy natural fats (such as ghee, sesame oil, or olive oil). Lubrication prevents dry intestinal friction and aids nutrient absorption.",
          "Matravat Ashniyat (Eat in Proper Quantity): Never overeat. The stomach should be divided into four conceptual quadrants: two parts solid food, one part warm liquid, and one part empty space to allow digestive gases to circulate freely.",
          "Jirne Ashniyat (Eat Only When Previous Meal is Digested): Never eat until true hunger returns, eructations are clean, and the chest feels light.",
          "Virya Aviruddham (Eat Foods of Compatible Potency): Avoid combining conflicting foods like hot fish with cold milk, or melon with dairy.",
          "Ishte Deshe, Ishta Sarvopakaranam (Eat in a Peaceful, Pleasing Environment): Avoid eating in noisy, stressful, or chaotic environments.",
          "Na Atidrutam (Do Not Eat Too Quickly): Rapid eating impairs the chewing reflex, swallows air, and fails to register satiety signals.",
          "Na Ativilambitam (Do Not Eat Excessively Slowly): Eating over prolonged hours leads to uneven digestion and sluggish enzyme activity.",
          "Ajalpan, Ahasan, Tanmana Bhunjita (Eat Without Talking, Laughing, or Distraction): Put away smartphones, computers, and intense discussions during meals to maintain parasympathetic dominance.",
        ],
      },
    ],
    classicalReferences: [
      "Charaka Samhita Vimanasthana 1/24-25: 'The rules of eating: warm, unctuous, measured, digested, compatible, in a pleasant place, neither too fast nor too slow, without distraction.'",
    ],
    modernContextNote: "Directly aligns with modern autonomic neuroscience: entering a parasympathetic ('rest and digest') nervous state via the vagus nerve is mandatory for optimal gastric acid secretion and bile release.",
    tags: ["Mindful Eating", "Ahara Vidhi", "Meal Habits", "Digestion", "Charaka Samhita"],
    featured: false,
  },
  {
    id: "dinacharya-sacred-daily-routines",
    title: "Dinacharya: Sacred Daily Routines from Sunrise to Sleep",
    subtitle: "Aligning your biological clock with nature's circadian doshic rhythms.",
    category: "lifestyle",
    readTime: "8 min read",
    targetDosha: "all",
    summary: "A practical walkthrough of the classical Ayurvedic daily schedule (Dinacharya) designed to maximize physical vitality, mental clarity, and longevity.",
    sections: [
      {
        heading: "The Circadian Clock in Ayurveda",
        content: "Thousands of years before modern medicine discovered circadian clock genes, Ayurveda mapped the 24-hour cycle into six 4-hour phases governed by the three doshas. Understanding this cycle allows you to schedule your sleep, meals, workouts, and work tasks to leverage natural biological peaks.",
        bulletPoints: [
          "6:00 AM - 10:00 AM (Kapha Period): Calm, heavy, grounding energy. Ideal time for early rising, cleansing, and vigorous morning exercise before heaviness sets in.",
          "10:00 AM - 2:00 PM (Pitta Period): Peak metabolic and digestive fire. The sun is at its zenith; this is the optimal window to eat your largest, most substantial meal of the day.",
          "2:00 PM - 6:00 PM (Vata Period): Light, mobile, creative mental energy. Excellent for strategic thinking, creative writing, communication, and focused study.",
          "6:00 PM - 10:00 PM (Kapha Period): Winding down, relaxing, evening dinner (light, before 7:30 PM), reading, and preparing for bed before 10:00 PM.",
          "10:00 PM - 2:00 AM (Pitta Period): Internal metabolic maintenance, liver detox, cellular repair, and brain memory consolidation. If you stay awake past 10 PM, a 'second wind' of mental restlessness occurs.",
          "2:00 AM - 6:00 AM (Vata Period): Subtle spiritual energy and lightness. The period before sunrise (Brahma Muhurta, approx. 4:30 - 5:30 AM) is ideal for meditation and prayer.",
        ],
      },
      {
        heading: "Key Morning Rituals (Dinacharya Practices)",
        content: "1. Brahma Muhurta Jagrana: Wake up 45 minutes before sunrise when the atmosphere is charged with clarity.\n2. Tongue Scraping (Jihwa Nirlekhana): Use a copper or stainless-steel scraper to remove nocturnal Ama coating.\n3. Oil Pulling (Gandusha / Kavala): Swish 1 tbsp warm sesame or coconut oil for 5-10 minutes to strengthen gums and jaw.\n4. Warm Water Hydration (Ushnapana): Drink 1-2 cups of warm water to stimulate gastrocolic reflex.\n5. Self-Massage (Abhyanga): Warm unrefined oil massaged over the entire body before showering to soothe Vata and nourish skin.",
      },
    ],
    classicalReferences: [
      "Ashtanga Hridaya Sutrasthana 2/1: 'One should wake up during Brahma Muhurta (the ambrosial hours before dawn) for preserving one's health and life.'",
    ],
    modernContextNote: "Awarded the 2017 Nobel Prize in Physiology or Medicine, circadian rhythm biology verifies that cellular metabolic genes cycle in precise 24-hour patterns matching Ayurvedic Dinacharya.",
    tags: ["Dinacharya", "Circadian Rhythm", "Morning Routine", "Abhyanga", "Longevity"],
    featured: true,
  },
  {
    id: "science-of-rasa-virya-vipaka",
    title: "The Energetics of Nutrition: Rasa, Virya, Vipaka, and Prabhava",
    subtitle: "How Ayurveda decodes the physiological impact of every herb and food ingredient.",
    category: "nutrition",
    readTime: "9 min read",
    targetDosha: "all",
    summary: "Discover the four-tier pharmacological and nutritional framework used by Ayurvedic physicians to classify ingredients and formulate balanced meals.",
    sections: [
      {
        heading: "Beyond Modern Chemical Analysis",
        content: "Where modern nutritional science analyzes food into chemical constituents (amino acids, lipids, vitamins, minerals), classical Ayurveda uses a sophisticated four-stage energetic paradigm (Dravyaguna Vijnana) that describes how a substance acts upon the living human organism from the instant it touches the tongue to its final cellular transformation.",
      },
      {
        heading: "1. Rasa (Primary Taste on Tongue)",
        content: "Rasa is the initial taste perceived by the gustatory receptors. The six tastes (Madhura, Amla, Lavana, Katu, Tikta, Kashaya) immediately send nervous and hormonal signals to the brain and stomach, triggering specific digestive enzymes and emotional states.",
      },
      {
        heading: "2. Guna (Physical Qualities)",
        content: "Every food carries specific physical attributes (20 Gurvadi Gunas in ten opposing pairs, such as Guru/Laghu = Heavy/Light, Sheeta/Ushna = Cold/Hot, Snigdha/Ruksha = Oily/Dry). Like increases like, while opposites create balance.",
      },
      {
        heading: "3. Virya (Thermal Potency)",
        content: "Virya represents the active thermodynamic force of a substance after it enters the stomach. Substances are primarily classified as either Sheeta Virya (Cooling—calms Pitta, slows metabolism, builds tissue) or Ushna Virya (Heating—kindles Agni, pacifies Vata/Kapha, promotes sweating, increases circulation).",
      },
      {
        heading: "4. Vipaka (Post-Digestive Effect)",
        content: "Vipaka is the long-term metabolic action that occurs after food has undergone complete digestion and assimilation in the lower bowel. There are three Vipakas: Madhura (Sweet—anabolic, builds tissues), Amla (Sour—increases Pitta secretions), and Katu (Pungent—catabolic, drying, reduces mass).",
      },
      {
        heading: "5. Prabhava (Unique Inherent Action)",
        content: "When two substances have identical Rasa, Virya, and Vipaka, yet produce radically different physiological actions, this special, non-linear property is termed Prabhava (special potency). For example, both Ghee and Castor oil are sweet, yet Castor oil is a powerful purgative due to its Prabhava.",
      },
    ],
    classicalReferences: [
      "Charaka Samhita Sutrasthana 26/65-72: Comprehensive discourse on Rasa, Guna, Virya, and Vipaka in the debate among ancient sages.",
    ],
    modernContextNote: "Mirrors pharmacological pharmacokinetics and pharmacodynamics, explaining how phytochemical matrices produce biological responses beyond simple caloric content.",
    tags: ["Rasa", "Virya", "Vipaka", "Prabhava", "Dravyaguna", "Ayurvedic Pharmacology"],
    featured: false,
  },
];

