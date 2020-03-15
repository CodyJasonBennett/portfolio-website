import React, { lazy, useMemo, Suspense, Fragment } from 'react';
import styled, { useTheme } from 'styled-components/macro';
import { Helmet } from 'react-helmet-async';
import ProgressiveImage from 'components/ProgressiveImage';
import { useScrollRestore } from 'hooks';
import Footer from 'components/Footer';
import {
  ProjectContainer, ProjectBackground, ProjectHeader, ProjectSection,
  ProjectSectionContent, ProjectImage, ProjectSectionColumns, SidebarImageText,
  ProjectSectionHeading, ProjectSectionText, SidebarImage, ProjectTextRow
} from 'components/Project';
import prerender from 'utils/prerender';
import mystgangBackground from 'assets/mystgang-background.png';
import mystgangBackgroundLarge from 'assets/mystgang-background-large.png';
import mystgangBackgroundPlaceholder from 'assets/mystgang-background-placeholder.png';
import mystgang from 'assets/mystgang.png';
import mystgangLarge from 'assets/mystgang-large.png';
import mystgangPlaceholder from 'assets/mystgang-placeholder.png';
import mystgangBranding from 'assets/mystgang-branding.png';
import mystgangBrandingLarge from 'assets/mystgang-branding-large.png';
import mystgangBrandingPlaceholder from 'assets/mystgang-branding-placeholder.png';
import mystgangLogo from 'assets/mystgang-logo.png';
import mystgangLogoPlaceholder from 'assets/mystgang-logo-placeholder.png';
import mystgangSlidePlaceholder from 'assets/mystgang-slide-placeholder.png';
import mystgangSlide1 from 'assets/mystgang-slide-1.png';
import mystgangSlide1Large from 'assets/mystgang-slide-1-large.png';
import mystgangSlide2 from 'assets/mystgang-slide-2.png';
import mystgangSlide2Large from 'assets/mystgang-slide-2-large.png';
import mystgangSlide3 from 'assets/mystgang-slide-3.png';
import mystgangSlide3Large from 'assets/mystgang-slide-3-large.png';
import mystgangSlide4 from 'assets/mystgang-slide-4.png';
import mystgangSlide4Large from 'assets/mystgang-slide-4-large.png';
import mystgangSlide5 from 'assets/mystgang-slide-5.png';
import mystgangSlide5Large from 'assets/mystgang-slide-5-large.png';
import mystgangSlide6 from 'assets/mystgang-slide-6.png';
import mystgangSlide6Large from 'assets/mystgang-slide-6-large.png';
import mystgangSlide7 from 'assets/mystgang-slide-7.png';
import mystgangSlide7Large from 'assets/mystgang-slide-7-large.png';
import mystgangSlide8 from 'assets/mystgang-slide-8.png';
import mystgangSlide8Large from 'assets/mystgang-slide-8-large.png';

const DisplacementCarousel = lazy(() => import('components/DisplacementCarousel'));
const title = 'MystGang 2019';
const description = 'A personal site for the gaming content creator known as MystGang. This project involved designing a hub to connect MystGang\'s content and social media.';
const roles = [
  'Branding & Identity',
  'UI / UX Design',
  'Front-end Development',
];

function MystGang() {
  const theme = useTheme();
  useScrollRestore();

  return (
    <Fragment>
      <Helmet
        title={`Projects | ${title}`}
        meta={[{ name: 'description', content: description }]}
      />
      <ProjectContainer>
        <ProjectBackground
          srcSet={`${mystgangBackground} 1000w, ${mystgangBackgroundLarge} 1920w`}
          placeholder={mystgangBackgroundPlaceholder}
          entered={!prerender}
        />
        <ProjectHeader
          title={title}
          description={description}
          url="https://mystgang.ml"
          roles={roles}
        />
        <ProjectSection>
          <ProjectSectionContent>
            <ProjectImage>
              <ProgressiveImage
                reveal
                srcSet={`${mystgang} 800w, ${mystgangLarge} 1440w`}
                placeholder={mystgangPlaceholder}
                sizes={`(max-width: ${theme.mobile}px) 500px, (max-width: ${theme.tablet}px) 800px, 1000px`}
                alt="Landing screne of the MystGang website."
              />
            </ProjectImage>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection>
          <ProjectSectionColumns>
            <SidebarImageText>
              <ProjectSectionHeading>Building an Identity</ProjectSectionHeading>
              <ProjectSectionText>
                We started out laying the foundations of MystGang's brand.
              </ProjectSectionText>
              <ProjectSectionText>
                Subtle, muted colors, an elegant typeface complete with their signature color: brown.
              </ProjectSectionText>
            </SidebarImageText>
            <SidebarImage
              srcSet={`${mystgangBranding} 400w, ${mystgangBrandingLarge} 898w`}
              placeholder={mystgangBrandingPlaceholder}
              sizes={`(max-width: ${theme.mobile}px) 100vw, (max-width: ${theme.tablet}px) 100vw, 50vw`}
              alt="MystGang's color palette, ranging from white to smooth, dark brown."
            />
          </ProjectSectionColumns>
        </ProjectSection>
        <ProjectSection light>
          <ProjectSectionContent>
            <LogoContainer>
              <ProgressiveImage
                src={mystgangLogo}
                srcSet={mystgangLogo}
                placeholder={mystgangLogoPlaceholder}
                sizes={`(max-width: ${theme.mobile}px) 100vw, (max-width: ${theme.tablet}px) 100vw, 50vw`}
                alt="MystGang's Monogram, featuring a custom designed letter M."
              />
            </LogoContainer>
            <ProjectTextRow center>
              <ProjectSectionHeading>Identity Design</ProjectSectionHeading>
              <ProjectSectionText>
                The monogram uses custom typography and colors to get the right balance of weight and angularity.
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
        <ProjectSection>
          <ProjectSectionContent>
            <ProjectTextRow center>
              <ProjectSectionHeading>The Website</ProjectSectionHeading>
            </ProjectTextRow>
          </ProjectSectionContent>
          <ProjectSectionSlider>
            <Suspense fallback={null}>
              <DisplacementCarousel
                placeholder={mystgangSlidePlaceholder}
                images={useMemo(() => [
                  {
                    src: mystgangSlide1,
                    srcset: `${mystgangSlide1} 960w, ${mystgangSlide1Large} 1920w`,
                    alt: 'MystGang Splash Screen',
                    override: true
                  },
                  {
                    src: mystgangSlide2,
                    srcset: `${mystgangSlide2} 960w, ${mystgangSlide2Large} 1920w`,
                    alt: 'MystGang Home Screen',
                  },
                  {
                    src: mystgangSlide3,
                    srcset: `${mystgangSlide3} 960w, ${mystgangSlide3Large} 1920w`,
                    alt: 'MystGang Fullscreen Menu',
                  },
                  {
                    src: mystgangSlide4,
                    srcset: `${mystgangSlide4} 960w, ${mystgangSlide4Large} 1920w`,
                    alt: 'MystGang Work Screen',
                  },
                  {
                    src: mystgangSlide5,
                    srcset: `${mystgangSlide5} 960w, ${mystgangSlide5Large} 1920w`,
                    alt: 'MystGang About Self'
                  },
                  {
                    src: mystgangSlide6,
                    srcset: `${mystgangSlide6} 960w, ${mystgangSlide6Large} 1920w`,
                    alt: 'MystGang About Work',
                  },
                  {
                    src: mystgangSlide7,
                    srcset: `${mystgangSlide7} 960w, ${mystgangSlide7Large} 1920w`,
                    alt: 'MystGang About Socials',
                  },
                  {
                    src: mystgangSlide8,
                    srcset: `${mystgangSlide8} 960w, ${mystgangSlide8Large} 1920w`,
                    alt: 'MystGang Contact Screen',
                  },
                ], [])}
                width={useMemo(() => 1920, [])}
                height={useMemo(() => 1080, [])}
              />
            </Suspense>
          </ProjectSectionSlider>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </Fragment>
  );
}

const ProjectSectionSlider = styled(ProjectSectionContent)`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 70px;
  margin: 0;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.colorBackground};
  padding: 60px 80px;
  margin-bottom: 80px;
  width: 100%;

  @media (max-width: ${props => props.theme.mobile}px) {
    padding: 30px 40px;
    margin-bottom: 40px;
  }

  div, img {
    max-width: 800px;
  }
`;

export default MystGang;
