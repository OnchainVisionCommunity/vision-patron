// src/Roadmap.tsx
import React from 'react';

// @ts-ignore
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const Roadmap: React.FC = () => {
  return (
    <section className="my-12">
    <hr className="sep2" />
      <h2 className="text-3xl font-bold text-center mb-8">Patron Roadmap</h2>
      <VerticalTimeline className="custom-timeline">
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#000', color: '#fff', border: '1px solid #fff',}}
          contentArrowStyle={{ borderRight: '7px solid  #fff' }}
          date="Phase 01 (Finished)"
          iconStyle={{ background: '#000', color: '#fff' }}
          
        >
          <h3 className="vertical-timeline-element-title titleroad">Launch Initial Version</h3>
          <p>$VISION Onchain Patreon Launch with Launch Features for Patrons and Creators (Minimum Viable Product - MVP)</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#0052ff', color: '#fff', border: '1px solid #fff',}}
          contentArrowStyle={{ borderRight: '7px solid  #fff' }}
          date="Phase 02"
          iconStyle={{ background: '#0052ff', color: '#fff' }}
          
        >
          <h3 className="vertical-timeline-element-title titleroad">Expanding Community Tools and Enhancing Swap</h3>
          <p>Launching new tools and improving existing tools for content creators to have a closer relationship with their patrons. Smartcontract to help improve swaps.</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#0052ff', color: '#fff', border: '1px solid #fff',}}
          contentArrowStyle={{ borderRight: '7px solid  #fff' }}
          date="Phase 03"
          iconStyle={{ background: '#0052ff', color: '#fff' }}
          
        >
          <h3 className="vertical-timeline-element-title titleroad">Warpcast Integration</h3>
          <p>Patron $VISION integration into Warpcast frames, facilitating patron onchains and creator reach</p>
        </VerticalTimelineElement>
        <VerticalTimelineElement
          className="vertical-timeline-element--work"
          contentStyle={{ background: '#0052ff', color: '#fff', border: '1px solid #fff',}}
          contentArrowStyle={{ borderRight: '7px solid  #fff' }}
          date="Phase 04"
          iconStyle={{ background: '#0052ff', color: '#fff' }}
          
        >
          <h3 className="vertical-timeline-element-title titleroad">QR Code</h3>
          <p>Enhanced tool allowing patrons to submit tips and join communities by taking photos of QR Codes at exhibitions or street art</p>
        </VerticalTimelineElement>
      </VerticalTimeline>
    </section>
  );
};

export default Roadmap;
