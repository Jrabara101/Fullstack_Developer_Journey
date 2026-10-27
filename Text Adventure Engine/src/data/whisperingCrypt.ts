import { StoryCartridge } from '../types/engine';

export const WHISPERING_CRYPT: StoryCartridge = {
  id: 'whispering_crypt',
  title: 'The Whispering Crypt',
  author: 'Sister Morwenna of the Black Shroud',
  version: '1.0.4',
  synopsis: 'Deep beneath the ruins of St. Jude\'s Priory lies a subterranean sepulcher where cold stone whispers ancient confessions. Armed with only a guttering lantern and your wits, solve the seals of the penitents.',
  startingRoomId: 'catacomb_entrance',
  initialFlags: {
    lantern_lit: true,
    sarcophagus_opened: false,
    bell_rung: false,
  },
  initialVariables: {
    dread_level: 1,
  },
  entities: {
    rusted_lantern: {
      id: 'rusted_lantern',
      name: 'Rusted Iron Lantern',
      aliases: ['lantern', 'lamp', 'light'],
      description: 'An ancient perforated iron lantern emitting a warm, flickering amber flame.',
      isTakeable: true,
      isUsable: true,
      onInspectText: 'The oil reservoir is half full of aromatic whale oil. It casts long, dancing shadows across the damp limestone.',
      onUseText: 'You adjust the wicker shutter. The lantern casts a wider cone of protective light against the encroaching gloom.',
    },
    bone_key: {
      id: 'bone_key',
      name: 'Carved Bone Key',
      aliases: ['key', 'bone key'],
      description: 'A key carved from ancient, yellowed bone, bearing the insignia of the Silent Order.',
      isTakeable: true,
      isUsable: true,
      onInspectText: 'Chiseled into the stem is the word: "REQUIEM". It fits the iron gate leading into the Inner Ossuary.',
      onUseText: 'The bone key slides smoothly into the cold iron tumblers.',
      unlocksExitDirection: 'north',
    },
    stone_sarcophagus: {
      id: 'stone_sarcophagus',
      name: 'Carved Stone Sarcophagus',
      aliases: ['sarcophagus', 'tomb', 'coffin'],
      description: 'A heavy limestone tomb depicting a blindfolded bishop clutching a ceremonial rosary.',
      isTakeable: false,
      isUsable: true,
      onInspectText: 'The stone lid is slightly ajar. A chilling draught seeps from within.',
      onUseText: 'With a heavy scraping groan, you push the lid aside. Inside lies the Carved Bone Key!',
      setFlagsOnUse: ['sarcophagus_opened'],
    },
  },
  rooms: {
    catacomb_entrance: {
      id: 'catacomb_entrance',
      title: 'Entrance to the Catacombs',
      biomeMood: 'crypt',
      descriptionMarkup: '[dropcap]C[/dropcap]old moisture drips ceaselessly from the limestone ceiling. Lichen clings to cracked flagstones leading into the subterranean dark.\n\nResting on an iron sconce by your side is the [[Rusted Iron Lantern|id:rusted_lantern|actions:inspect,take,use]].\n\nTo the **north**, a rusted iron gate bars the way into the Ossuary. To the **east**, a damp passage leads toward the Hall of Tombs.',
      editorPosition: { x: 180, y: 220 },
      entityIds: ['rusted_lantern'],
      exits: [
        {
          direction: 'north',
          targetRoomId: 'inner_ossuary',
          isLocked: true,
          lockDescription: 'The iron gate is bound by a heavy skeleton padlock requiring the Carved Bone Key.',
          unlockCondition: {
            requiredItems: ['bone_key'],
          },
          conduitLabel: 'Iron Gate (Locked)',
        },
        {
          direction: 'east',
          targetRoomId: 'hall_of_tombs',
          conduitLabel: 'Passage to Tombs',
        },
      ],
      choices: [
        {
          id: 'listen_shadows',
          label: 'Listen to the echoing drips',
          responseMarkup: '[ghost]Faint, incoherent murmurs rise from the depths—voices long deceased reciting evening vespers.[/ghost]',
        },
      ],
    },
    hall_of_tombs: {
      id: 'hall_of_tombs',
      title: 'The Hall of Tombs',
      biomeMood: 'crypt',
      descriptionMarkup: 'Recessed alcoves line both sides of the corridor, each containing the repose of ancient priory elders.\n\nIn the center alcove stands the [[Carved Stone Sarcophagus|id:stone_sarcophagus|actions:inspect,use]].\n\n{if flag:sarcophagus_opened}Inside the open tomb, the [[Carved Bone Key|id:bone_key|actions:inspect,take]] rests upon velvet shroud remnants.{/if}\n\nA passage leads **west** back to the entrance.',
      editorPosition: { x: 500, y: 220 },
      entityIds: ['stone_sarcophagus', 'bone_key'],
      exits: [
        {
          direction: 'west',
          targetRoomId: 'catacomb_entrance',
          conduitLabel: 'West to Entrance',
        },
      ],
      choices: [],
    },
    inner_ossuary: {
      id: 'inner_ossuary',
      title: 'The Inner Ossuary',
      biomeMood: 'sanctuary',
      descriptionMarkup: '[gold]Thousands of polished skulls form geometric mosaics upon the vaulting.[/gold]\n\nAt the chamber\'s heart stands a stone altar bathed in ethereal moonlight filtering through a high street grate. You have unraveled the peace of St. Jude\'s.',
      editorPosition: { x: 180, y: 500 },
      entityIds: [],
      exits: [
        {
          direction: 'south',
          targetRoomId: 'catacomb_entrance',
          conduitLabel: 'Return South',
        },
      ],
      choices: [
        {
          id: 'kneel_altar',
          label: 'Kneel before the altar',
          responseMarkup: 'A profound wave of tranquility washes over you. The restless whispers fade into silent benediction.',
        },
      ],
    },
  },
};
