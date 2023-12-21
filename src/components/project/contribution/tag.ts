export const TagColorMap: Record<string, string> = {
	'#FEEDEB': '#491410',
	'#FFF3E0': '#391A00',
	'#E6F7FF': '#002338',
	'#E1F3E2': '#00200D',
	'#FBF6C7': '#4D2100',
	'#F2F4F6': '#181D24',
	'#EDE7F6': '#180038',
	'#EDF1DA': '#182700',
	'#E9EBF7': '#0E184C',
	'#FCE8F9': '#3A071B',
};

export type ValueOf<T> = T[keyof T];
export type ITagBgColor = keyof typeof TagColorMap;
export type ITagTextColor = ValueOf<typeof TagColorMap>;

export const TagBgColors: ITagBgColor[] = Object.keys(TagColorMap);
export const TagTextColors: ITagTextColor[] = TagBgColors.map(key => TagColorMap[key]);
