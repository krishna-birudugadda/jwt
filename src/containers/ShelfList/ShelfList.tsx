import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import shallow from 'zustand/shallow';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate } from 'react-router';

import styles from './ShelfList.module.scss';

import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import ShelfComponent from '#components/Shelf/Shelf';
import usePlaylist from '#src/hooks/usePlaylist';
import { mediaURL, slugify } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';
import type { Content } from '#types/Config';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { parseAspectRatio, parseTilesDelta } from '#src/utils/collection';
import InfiniteScrollLoader from '#components/InfiniteScrollLoader/InfiniteScrollLoader';
import { logDev, testId } from '#src/utils/common';

const INITIAL_ROW_COUNT = 6;
const LOAD_ROWS_COUNT = 4;

type Props = {
  rows: Content[];
};

const ShelfList = ({ rows }: Props) => {
  const navigate = useNavigate();
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const [rowCount, setRowCount] = useState(INITIAL_ROW_COUNT);

  const watchHistoryDictionary = useWatchHistoryStore((state) => state.getDictionary());

  const { data: { playlist } = { playlist: [] } } = usePlaylist(rows.find((el) => el.contentId)?.contentId as string);
  const updateBlurImage = useBlurImageUpdater(playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const onCardClick = useCallback(
    (playlistItem, playlistId, type) => {
      navigate(mediaURL(playlistItem, playlistId, type === PersonalShelf.ContinueWatching));
    },
    [navigate],
  );
  const onCardHover = useCallback(
    (playlistItem: PlaylistItem) => {
      updateBlurImage(playlistItem);
    },
    [updateBlurImage],
  );

  useEffect(() => {
    // reset row count when the page changes
    setRowCount(INITIAL_ROW_COUNT);
  }, [rows]);

  return (
    <div className={styles.home}>
      <InfiniteScroll
        pageStart={0}
        style={{ overflow: 'hidden' }}
        loadMore={() => setRowCount((current) => current + LOAD_ROWS_COUNT)}
        hasMore={rowCount < rows.length}
        role="grid"
        loader={<InfiniteScrollLoader key="loader" />}
      >
        {rows.slice(0, rowCount).map((row, index) => (
          <PlaylistContainer type={row.type} playlistId={row.contentId} key={`${row.contentId || row.type}_${index}`}>
            {({ playlist, error, isLoading, style }) => {
              const title = row?.title || playlist.title;
              const posterAspect = parseAspectRatio(playlist.shelfImageAspectRatio);
              const visibleTilesDelta = parseTilesDelta(posterAspect);

              return (
                <div
                  style={style}
                  role="row"
                  className={classNames(styles.shelfContainer, { [styles.featured]: row.featured })}
                  data-testid={testId(`shelf-${row.featured ? 'featured' : row.type !== 'playlist' ? row.type : slugify(title)}`)}
                >
                  <div role="cell">
                    <ShelfComponent
                      loading={isLoading}
                      error={error}
                      type={row.type}
                      playlist={playlist}
                      watchHistory={row.type === PersonalShelf.ContinueWatching ? watchHistoryDictionary : undefined}
                      onCardClick={onCardClick}
                      onCardHover={onCardHover}
                      enableTitle={row.enableText}
                      enableCardTitles={config.styling.shelfTitles}
                      title={title}
                      featured={row.featured === true}
                      accessModel={accessModel}
                      isLoggedIn={!!user}
                      hasSubscription={!!subscription}
                      posterAspect={posterAspect}
                      visibleTilesDelta={visibleTilesDelta}
                    />
                  </div>
                </div>
              );
            }}
          </PlaylistContainer>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ShelfList;
