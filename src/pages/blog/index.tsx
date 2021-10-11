import type { GetStaticProps } from 'next';
import type {
  IBlogEntry,
  ITag,
  ITagFields,
} from '../../types/generated/contentful';
import { usePagination } from 'react-use-pagination';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltLeft as leftArrow,
  faLongArrowAltRight as rightArrow,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import useFuse from '../../hooks/useFuse';
import BlogEntrySummary from '../../components/layout/blog/blogEntrySummary';
import Head from 'next/head';
import { DarkButton } from '../../components/decoration/buttons';
import { getBlogEntries } from '../../lib/cms/helpers';
import SquareField from '../../components/decoration/squares';
import BlogsHeader from '../../components/layout/blog/blogsHeader';
import Newsletter from '../../components/layout/newsletter';
import { getContents } from '../../lib/cms';
import SubtleBorder from '../../components/decoration/subtleBorder';

interface BlogProps {
  blogs: IBlogEntry[];
  tags: ITag[];
}

export const getStaticProps: GetStaticProps = async () => {
  const blogs = await getBlogEntries();
  const tags = await getContents<ITagFields>({ contentType: 'tag' });

  return {
    props: {
      blogs,
      tags,
    },
    revalidate: 480,
  };
};

const filterByTag: (entry: IBlogEntry, tagQuery?: string | null) => boolean = (
  entry,
  tagQuery
) => {
  if (tagQuery === undefined) return true;

  if (tagQuery !== null) {
    return !!entry.fields.tags?.find((tag) => tag.fields.slug === tagQuery);
  }

  return !entry.fields.tags;
};

const Blog: React.FC<BlogProps> = ({ blogs, tags }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [tagQuery, setTagQuery] = useState<string | null | undefined>(null);

  const [firstBlog, ...otherBlogs] = blogs;

  const filterKeys = ['fields.title'];

  const filteredFirstBlog = useFuse({
    data: [firstBlog],
    options: { keys: filterKeys },
    term: searchQuery,
  }).filter((entry) => filterByTag(entry, tagQuery));

  const filteredEntries = useFuse({
    data: otherBlogs,
    options: { keys: filterKeys },
    term: searchQuery,
    sort: true,
  }).filter((entry) => filterByTag(entry, tagQuery));

  const {
    startIndex,
    endIndex,
    setPreviousPage,
    setNextPage,
    currentPage,
    previousEnabled,
    nextEnabled,
  } = usePagination({
    totalItems: filteredEntries.length,
    initialPageSize: 9,
  });

  return (
    <>
      <Head>
        <title>Blog | Vegan Hacktivists</title>
      </Head>
      <SquareField
        squares={[
          { color: 'grey', size: 32, top: 0, left: 0 },
          { color: 'grey-dark', size: 16, top: 0, left: 32 },
          { color: 'grey-dark', size: 16, top: 0, right: 0 },
        ]}
        className="z-10 hidden md:block"
      />
      <BlogsHeader
        tags={tags}
        onSearchChange={setSearchQuery}
        onTagChange={setTagQuery}
        query={searchQuery}
      />
      <SquareField
        squares={[
          { color: 'green-light', size: 32, top: -16, left: 0 },
          { color: 'yellow', size: 16, bottom: 16, left: 32 },
          { color: 'white', size: 16, bottom: 0, left: 32 },
          { color: 'pink', size: 32, bottom: 0, right: 16 },
          { color: 'orange', size: 16, top: 0, right: 0 },
          { color: 'white', size: 16, bottom: 0, right: 0 },
        ]}
        className="hidden lg:block"
      />
      <div className="pt-20 pb-20">
        <div className="grid md:grid-cols-3 md:gap-x-12 gap-y-10 px-10 xl:px-48 auto-rows-min">
          {filteredFirstBlog.length !== 0 && currentPage === 0 && (
            <SubtleBorder
              key={filteredFirstBlog[0].fields.slug}
              className="col-span-full"
            >
              <BlogEntrySummary blog={filteredFirstBlog[0]} heading />
            </SubtleBorder>
          )}
          {filteredEntries.slice(startIndex, endIndex + 1).map((blog) => (
            <SubtleBorder
              key={blog.fields.slug}
              className="col-span-full md:col-span-1"
            >
              <BlogEntrySummary blog={blog} />
            </SubtleBorder>
          ))}
        </div>
        <div className="flex flex-row mx-auto gap-10 justify-center p-16">
          <DarkButton
            onClick={() => {
              setPreviousPage();
            }}
            className="font-mono font-bold uppercase flex"
            disabled={!previousEnabled}
          >
            <div>
              <FontAwesomeIcon icon={leftArrow} size="xs" />
            </div>
            <span className="pl-3 hidden md:block">Previous</span>
          </DarkButton>
          <DarkButton
            onClick={() => {
              setNextPage();
            }}
            className="font-mono font-bold uppercase"
            disabled={!nextEnabled}
          >
            <div className="flex">
              <span className="pr-3 hidden md:block">Next</span>
              <div>
                <FontAwesomeIcon icon={rightArrow} size="xs" />
              </div>
            </div>
          </DarkButton>
        </div>
      </div>
      <SquareField
        squares={[
          { color: 'grey-background', size: 16, bottom: 0 },
          { color: 'grey-light', size: 16, top: 0, right: 0 },
          { color: 'grey-background', size: 16, bottom: 0, right: 0 },
        ]}
        className="hidden md:block"
      />
      <Newsletter />
    </>
  );
};

export default Blog;
