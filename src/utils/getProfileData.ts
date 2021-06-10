import nullthrows from 'nullthrows';

export async function getProfileData(
  url: URL
): Promise<FormattedProfileData> {
  const parser = new DOMParser();

  url.searchParams.set('profile_liquid', 'true');
  const response = await fetch(url.href);

  if (!response.ok) throw Error(response.statusText);

  const html = await response.text();
  const document = parser.parseFromString(html, 'text/html');

  if (noProfileFound(document)) {
    throw Error('Liquid profile not found for this page');
  }

  const profileData = JSON.parse(
    nullthrows(document.querySelector('#liquidProfileData')).textContent || '',
  );

  return cleanProfileData(profileData);
}

function noProfileFound(document: HTMLDocument) {
  return document.querySelector('#liquidProfileData') === null;
}

function formatLiquidProfileData(
  entries: ProfileNode[],
): FormattedProfileNode[] {
  return entries.map((entry: ProfileNode) => {
    const nameParts = entry.partial.split('/');
    let name = '';
    let filepath = null;
    // TODO: to figure out based on back-end partial data returned
    if (nameParts.length === 1 && !entry.partial.includes(':')) {
      name = `snippet:${entry.partial}`;
      filepath = `snippets/${entry.partial}.liquid`;
    } else if (/shopify:\/\/apps/.test(entry.partial)) {
      name = `app-${nameParts[4].slice(0, -1)}:${nameParts[5]}:${nameParts[3]}`;
      entry.code = entry.code || entry.partial;
    } else if (nameParts[0] === 'sections') {
      name = `section:${nameParts[1].replace(/\.liquid$/, '')}`;
      filepath = entry.partial;
    } else {
      name = entry.partial;
      const partialParts = entry.partial.split(':');
      filepath = `${partialParts[0]}s/${partialParts[1]}${
        /\.json$/.test(name) ? '' : '.liquid'
      }`;
    }

    return {
      name,
      filepath,
      value: entry.total_time,
      children: formatLiquidProfileData(entry.children),
      code: entry.code,
      line: entry.line_number,
    };
  });
}

function cleanProfileData(profileData: ProfileData) {
  const cleanData = {
    name: profileData.name,
    value: profileData.value,
    filepath: null,
    code: '-',
    line: '-',
    children: formatLiquidProfileData(profileData.children),
  };
  return cleanData;
}
