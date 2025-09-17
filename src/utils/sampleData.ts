import { parseTranscript } from './data/textParsers';
import { transcriptToKnowledgeGraph } from './data/graphTransformers';
import { KnowledgeGraph } from '@/types/graph';

// Sample transcript content for demonstration
const SAMPLE_TRANSCRIPT = `
source: https://youtu.be/z8pA2TDXtew?si=wqjsHnEcj5b-M5RN

Transcript:
The US economy and financial system is the leader globally in laundering dirty money. I said to this wonderful group, let's pretend there's a big red button up here on the lectern. And if you push that button, you can stop all hard narcotics trafficking tomorrow. Who here will push the button? And out of a 100 people dedicated to evolving our society spiritually, guess how many would push the button? I don't know. One.

You suggested the control grid is in part designed to manage the population. So if you want to move people to a much lower economic footprint, having complete control is obviously very convenient. The bottom line is the majority is about to get a lot poorer. So the question is where is all this money going? And one of the things I've looked at is the underground base and city infrastructure and transportation system that's been built.

What would be the purpose? I think if you're worried about a near extinction event, so thank you for doing this. You get the sense if you're just a sort of aware person that there is a concerted attempt by governments around the world to digitize commerce and to digitize currency and to basically control people through money.

That's absolutely happening. And what's important to understand, it's been happening for a long time. This is like an invisible corral that they've been building around you for a long long time because how do a few sneak up on the many? Well, you have to do it very quietly and invisibly before you throw the trap.

So essentially what they're building is converting a currency system into a control system. So it's really the end of currency and what they're doing is they've been building the different digital pieces and when it integrates and comes together then you literally have a digital concentration camp.

During the Biden administration, Biden nominated somebody for control of currency who was ultimately not approved. The Republicans in the Senate killed the nomination. Before she was nominated, three weeks before she wrote an article in the Vanderbilt Law Review that said, "The great thing about central bank digital currency is you have the perfect tool to deal with inflation, if inflation gets out of hand, you just freeze everybody's bank accounts."

The US economy and financial system is the leader globally in laundering dirty money. When I was at the Department of Housing and Urban Development, I would find neighborhoods where we were spending 250,000 per unit to build public housing and $50,000 would buy and rehab a defaulted a foreclosed property in the FHA inventory.

From fiscal 1998 to fiscal 2015, there were 21 trillion of undocumentable adjustments in the US government. The question is, where's all this money going? And one of the things I've looked at is the underground base and city infrastructure and transportation system that's been built.

The Bank of International Settlements is the central bank of central banks. It has sovereign immunity. It's above the law. It's its own country. It has its own police force. And essentially, other than one of its staff being in a car accident or minor things, no one has the legal authority to move against it.

If I want to steal 21 trillion from the US government and park it on the balance sheet of the BIS, it can move it anywhere in the world and it can keep it on its balance sheet secretly.
`;

export function createSampleGraph(): KnowledgeGraph {
  const parsed = parseTranscript(SAMPLE_TRANSCRIPT, 'Catherine Austin Fitts Interview');
  return transcriptToKnowledgeGraph(parsed);
}

export function getTranscriptContent(): string {
  return SAMPLE_TRANSCRIPT;
}