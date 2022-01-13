import type { GetStaticPaths, GetStaticProps } from 'next';
import { getContents } from '../../lib/cms';
import type { IBlogEntry, ITeamMember } from '../../types/generated/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import {
  getAllBlogSlugs,
  getBlogEntries,
  getBlogPreviewBySlug,
} from '../../lib/cms/helpers';
import ContentfulImage from '../../components/layout/contentfulImage';
import SquareField from '../../components/decoration/squares';
import React from 'react';
import Circle from '../../components/decoration/circle';
import BlogContentContainer, {
  Sidebar,
} from '../../components/layout/blog/blogPageLayout';
import SubtleBorder from '../../components/decoration/subtleBorder';
import { NextSeo } from 'next-seo';
import RichText from '../../components/decoration/richText';

interface BlogEntryProps {
  blog: IBlogEntry;
  otherBlogs: IBlogEntry[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allSlugs = await getAllBlogSlugs();

  return {
    paths: allSlugs.map((slug) => ({ params: { slug } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params = {},
  preview = false,
}) => {
  const blog = await getEntryOrPreview(params.slug as string, preview);
  if (!blog) {
    return {
      notFound: true,
    };
  }

  const otherBlogsToShow = 5;

  const otherBlogs = (await getBlogEntries(otherBlogsToShow + 1))
    .filter((entry) => entry.fields.slug !== params.slug)
    .slice(0, otherBlogsToShow);

  return {
    props: {
      blog,
      otherBlogs,
    },
    revalidate: 480,
  };
};

const getEntryOrPreview: (
  slug: string,
  preview: boolean
) => Promise<IBlogEntry> = async (slug, preview) => {
  if (preview) {
    return await getBlogPreviewBySlug(slug);
  }

  return (
    await getContents({ contentType: 'blogEntry', query: { slug } })
  )[0] as IBlogEntry;
};

const Header: React.FC = () => {
  return (
    <div className="absolute w-full -z-10 overflow-hidden">
      <div className="relative z-10">
        <Circle opacity={0.1} xAlign="left" yAlign="top" radiusZoom={0.5} />
        <Circle
          opacity={0.05}
          xAlign="right"
          yAlign="bottom"
          radiusZoom={0.3}
        />
      </div>
      <div className="bg-black relative h-36 lg:h-80" />
      <div className="z-20">
        <SquareField
          squares={[
            // TODO tweak
            { color: 'white', size: 16, left: 0, bottom: 0 },
            { color: 'green', size: 32, left: 16, bottom: 0 },
            { color: 'yellow', size: 16, left: 0, top: 0 },
            { color: 'orange', size: 16, right: 32, bottom: 16 },
            { color: 'red', size: 32, right: 0, top: -16 },
            { color: 'white', size: 16, right: 32, bottom: 0 },
          ]}
          className="hidden md:block"
        />
      </div>
    </div>
  );
};

const BlogEntry: React.FC<BlogEntryProps> = ({ blog, otherBlogs }) => {
  if (!blog) {
    return <div>Loading...</div>;
  }

  const { title, author, content, featuredImage } = blog.fields;

  const date = new Date(blog.fields.publishDate || blog.sys.createdAt);

  return (
    <>
      <NextSeo title={title} titleTemplate="%s | Vegan Hacktivists Blog" />
      <div>
        <Header />
        <div className="mx-auto">
          <div className="px-5 lg:w-3/5 pt-20 mx-auto">
            {featuredImage && (
              <div className="border-2 border-white mx-auto">
                <ContentfulImage
                  image={featuredImage}
                  alt=""
                  layout="responsive"
                  priority
                />
              </div>
            )}
          </div>
          <div className="mt-20">
            <h1 className="text-5xl font-bold w-3/4 mx-auto text-left">
              {title}
            </h1>
            <BlogContentContainer>
              <div className="text-left text-xl leading-relaxed space-y-4 md:flex-grow overflow-x-auto">
                {author && (
                  <div>
                    Written by{' '}
                    <span className="font-bold">{author.fields.name}</span>{' '}
                    <span className="font-bold">|</span>{' '}
                    <span>
                      {new Intl.DateTimeFormat('en', {
                        month: 'long',
                        year: 'numeric',
                        day: 'numeric',
                      }).format(date)}
                    </span>
                  </div>
                )}
                <div className="divide-y divide-grey-light">
                  <div className="pb-10">
                    <RichText document={content} />
                  </div>
                  {author && (
                    <div className="pt-5">
                      <AuthorCard author={author} />
                    </div>
                  )}
                </div>
              </div>
              <Sidebar blogs={otherBlogs} />
            </BlogContentContainer>
          </div>
        </div>
      </div>
    </>
  );
};

interface AuthorCardProps {
  author: ITeamMember;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const { image, name, description } = author.fields;

  return (
    <div className="mb-14">
      <div className="text-grey-dark text-3xl font-bold mb-10">
        About the Author
      </div>
      <SubtleBorder className="flex flex-col lg:flex-row gap-x-10 bg-grey-background p-5">
        {image && (
          <div className="w-full md:w-64">
            <ContentfulImage image={image} alt="" />
          </div>
        )}
        <div className="text-center lg:text-left lg:w-3/5">
          <div className="text-3xl font-bold">{name}</div>
          {description && <div>{documentToReactComponents(description)}</div>}
        </div>
      </SubtleBorder>
    </div>
  );
};

export default BlogEntry;
