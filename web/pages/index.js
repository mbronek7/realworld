import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import clsx from 'clsx';
import { ArticlePreview } from '../containers/article-preview';
import { Sidebar } from '../containers/sidebar';
import { FeedToggle } from '../containers/feed-toggle';
import withApollo from '../lib/with-apollo';
import { withLayout } from '../components/layout';
import { NetworkStatus } from 'apollo-client';

const HomePageArticlesQuery = gql`
  query HomePageArticlesQuery(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $tagName: String
  ) {
    viewer {
      ...FeedToggleUserFragment
    }
    articlesConnection(
      after: $after
      before: $before
      first: $first
      last: $last
      tagName: $tagName
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          ...ArticlePreviewArticleFragment
        }
      }
    }
    ...SidebarQueryFragment
  }
  ${ArticlePreview.fragments.article}
  ${FeedToggle.fragments.user}
  ${Sidebar.fragments.query}
`;

function HomePage() {
  const router = useRouter();
  const variables =
    typeof router.query.before !== 'undefined' ||
    typeof router.query.after !== 'undefined'
      ? {
          last: router.query.last ? parseInt(router.query.last) : null,
          first: router.query.first ? parseInt(router.query.first) : null,
          before: router.query.before ? router.query.before : null,
          after: router.query.after ? router.query.after : null,
          tagName: router.query.tagName
        }
      : { first: 10, tagName: router.query.tagName };

  const articles = useQuery(HomePageArticlesQuery, {
    variables,
    notifyOnNetworkStatusChange: true
  });

  if (articles.networkStatus == NetworkStatus.loading) return null;

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>
      <div className="container page">
        <div className="row">
          <div className="col-xs-12 col-md-9">
            <FeedToggle userId={articles.data.viewer?.id} />
            {articles.data.articlesConnection.edges.map(edge => (
              <ArticlePreview
                articleSlug={edge.node.slug}
                key={edge.node.slug}
              />
            ))}
            <nav>
              <ul className="pagination">
                <li
                  className={clsx('page-item', {
                    disabled:
                      articles.data.articlesConnection.pageInfo
                        .hasPreviousPage === false
                  })}
                >
                  <Link
                    href={{
                      pathname: '/',
                      query: router.query.tagName
                        ? {
                            before:
                              articles.data.articlesConnection.pageInfo
                                .startCursor,
                            last: 10,
                            tagName: router.query.tagName
                          }
                        : {
                            before:
                              articles.data.articlesConnection.pageInfo
                                .startCursor,
                            last: 10
                          }
                    }}
                  >
                    <a className="page-link">Previous</a>
                  </Link>
                </li>
                <li
                  className={clsx('page-item', {
                    disabled:
                      articles.data.articlesConnection.pageInfo.hasNextPage ===
                      false
                  })}
                >
                  <Link
                    href={{
                      pathname: '/',
                      query: router.query.tagName
                        ? {
                            after:
                              articles.data.articlesConnection.pageInfo
                                .endCursor,
                            first: 10,
                            tagName: router.query.tagName
                          }
                        : {
                            after:
                              articles.data.articlesConnection.pageInfo
                                .endCursor,
                            first: 10
                          }
                    }}
                  >
                    <a className="page-link">Next</a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="col-xs-12 col-md-3">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withApollo(withLayout(HomePage));
