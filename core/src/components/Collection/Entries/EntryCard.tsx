import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getAsset as getAssetAction } from '@staticcms/core/actions/media';
import { VIEW_STYLE_GRID, VIEW_STYLE_LIST } from '@staticcms/core/constants/collectionViews';
import { selectEntryCollectionTitle } from '@staticcms/core/lib/util/collection.util';
import { selectIsLoadingAsset } from '@staticcms/core/reducers/medias';

import type { ConnectedProps } from 'react-redux';
import type { CollectionViewStyle } from '@staticcms/core/constants/collectionViews';
import type { Field, Collection, Entry } from '@staticcms/core/interface';
import type { RootState } from '@staticcms/core/store';

const EntryCard = ({
  collection,
  entry,
  path,
  image,
  imageField,
  collectionLabel,
  viewStyle = VIEW_STYLE_LIST,
  getAsset,
}: NestedCollectionProps) => {
  const summary = useMemo(() => selectEntryCollectionTitle(collection, entry), [collection, entry]);

  const [imageUrl, setImageUrl] = useState<string>();
  useEffect(() => {
    if (!image) {
      return;
    }

    const getImage = async () => {
      setImageUrl((await getAsset(collection, entry, image, imageField)).toString());
    };

    getImage();
  }, [collection, entry, getAsset, image, imageField]);

  return (
    <Card>
      <CardActionArea component={Link} to={path}>
        {viewStyle === VIEW_STYLE_GRID && image && imageField ? (
          <CardMedia component="img" height="140" image={imageUrl} />
        ) : null}
        <CardContent>
          {collectionLabel ? (
            <Typography gutterBottom variant="h5" component="div">
              {collectionLabel}
            </Typography>
          ) : null}
          <Typography gutterBottom variant="h6" component="div" sx={{ margin: 0 }}>
            {summary}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

interface EntryCardOwnProps {
  entry: Entry;
  inferedFields: {
    titleField?: string | null | undefined;
    descriptionField?: string | null | undefined;
    imageField?: string | null | undefined;
    remainingFields?: Field[] | undefined;
  };
  collection: Collection;
  imageField?: Field;
  collectionLabel?: string;
  viewStyle?: CollectionViewStyle;
}

function mapStateToProps(state: RootState, ownProps: EntryCardOwnProps) {
  const { entry, inferedFields, collection } = ownProps;
  const entryData = entry.data;

  let image = inferedFields.imageField
    ? (entryData?.[inferedFields.imageField] as string | undefined)
    : undefined;
  if (image) {
    image = encodeURI(image);
  }

  const isLoadingAsset = selectIsLoadingAsset(state.medias);

  return {
    ...ownProps,
    path: `/collections/${collection.name}/entries/${entry.slug}`,
    image,
    imageField:
      'fields' in collection
        ? collection.fields?.find(f => f.name === inferedFields.imageField && f.widget === 'image')
        : undefined,
    isLoadingAsset,
  };
}

const mapDispatchToProps = {
  getAsset: getAssetAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type NestedCollectionProps = ConnectedProps<typeof connector>;

export default connector(EntryCard);
