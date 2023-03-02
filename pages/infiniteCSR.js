import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, QueryClient, dehydrate } from "react-query";

function InfiniteCSRPage() {
  const { data, status, fetchNextPage, hasNextPage } = useInfiniteQuery(
    "infiniteCharacters",
    async ({ pageParam = 1 }) =>
      await fetch(
        `https://rickandmortyapi.com/api/character/?page=${pageParam}`
      ).then((result) => result.json()),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.info.next) {
          return pages.length + 1;
        }
      },
    }
  );
  return (
    <div>
      <h1>
        Rick and Morty with React Query and Infinite Scroll - Client Side
        Rendered
      </h1>
      {status === "success" && (
        <InfiniteScroll
          dataLength={data?.pages.length * 20}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<h4>Loading...</h4>}
        >
          <div className="grid-container">
            {data?.pages.map((page) => (
              <>
                {page.results.map((character) => (
                  <article key={character.id}>
                    <img
                      src={character.image}
                      alt={character.name}
                      height={250}
                      loading="lazy"
                      width={"100%"}
                    />
                    <div className="text">
                      <p>Name: {character.name}</p>
                      <p>Lives in: {character.location.name}</p>
                      <p>Species: {character.species}</p>
                      <i>Id: {character.id} </i>
                    </div>
                  </article>
                ))}
              </>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  let page = 1;
  if (context.query.page) {
    page = parseInt(context.query.page);
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    ["characters", page],
    async () =>
      await fetch(
        `https://rickandmortyapi.com/api/character/?page=${page}`
      ).then((result) => result.json())
  );
  return { props: { dehydratedState: dehydrate(queryClient) } };
}

export default InfiniteCSRPage;
