import React from 'react';
import TimeAgo from 'react-timeago';
import englishStrings from 'react-timeago/lib/language-strings/en';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

export const fromObjectToList = object => object ? Object.keys(object).map(key => ({ ...object[key], index: key })) : [];
export const truncate = (text, limit=100) => !!text && text.length > limit ? `${text.substring(0, limit)} ...`: text;
export const slugify = (string) => {
    const a = 'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
    const b = 'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
  
    return string.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w-]+/g, '') // Remove all non-word characters
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
  }
export const randomString = (len, charSet) => {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++){
        const randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz+1);
    }
    return randomString;
}

const formatter = buildFormatter(englishStrings);

type DisplayTimeAgoProps = {
    time?: number;
    isTimeAgo?: boolean;
};

export const DisplayTimeAgo: React.FC<DisplayTimeAgoProps> = ({ time, isTimeAgo }) => {
    if (!time) {
        return null;
    }

    const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(time);

    if (isTimeAgo) {
        return <TimeAgo date={formatted} title={formatted} formatter={formatter} />;
    }

    return <>{formatted}</>;
};