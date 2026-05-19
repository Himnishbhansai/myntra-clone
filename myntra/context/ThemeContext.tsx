import React,{
createContext,
useContext,
useEffect,
useMemo,
useState
} from "react";

import AsyncStorage
from "@react-native-async-storage/async-storage";

import {Appearance}
from "react-native";

import {
baseThemes,
defaultAccent,
ThemeMode,
createSystemTheme
}
from "../theme/theme";

type ThemeContextType={

mode:ThemeMode;

setMode:(
mode:ThemeMode
)=>void;

accent:string;

setAccent:(
color:string
)=>void;

theme:{
background:string;
card:string;
text:string;
secondaryText:string;
border:string;
primary:string;
};

};

const ThemeContext=
createContext<
ThemeContextType|undefined
>(undefined);

export const ThemeProvider=({
children,
}:{
children:React.ReactNode;
})=>{

const[
mode,
setModeState
]=useState<ThemeMode>(
"system"
);

const[
accent,
setAccentState
]=useState(
defaultAccent
);

const deviceTheme=
Appearance.getColorScheme()
==="dark"
?"dark"
:"light";

useEffect(()=>{

const loadTheme=
async()=>{

try{

const savedMode=
await AsyncStorage.getItem(
"themeMode"
);

const savedAccent=
await AsyncStorage.getItem(
"accent"
);

if(savedMode){

setModeState(
savedMode as ThemeMode
);

}

if(savedAccent){

setAccentState(
savedAccent
);

}

}catch(err){

console.log(
"Theme load error",
err
);

}

};

loadTheme();

},[]);

const setMode=
async(
value:ThemeMode
)=>{

setModeState(
value
);

await AsyncStorage.setItem(
"themeMode",
value
);

};

const setAccent=
async(
color:string
)=>{

setAccentState(
color
);

await AsyncStorage.setItem(
"accent",
color
);

};

const currentTheme=
mode==="system"
?deviceTheme
:mode;

const theme=
useMemo(()=>{

if(mode==="light"){
return baseThemes.light;
}

if(mode==="dark"){
return baseThemes.dark;
}

return createSystemTheme(
accent
);

},
[
mode,
accent,
currentTheme
]);

return(

<ThemeContext.Provider
value={{
mode,
setMode,
accent,
setAccent,
theme
}}
>

{children}

</ThemeContext.Provider>

);

};

export const useTheme=()=>{

const context=
useContext(
ThemeContext
);

if(!context){

throw new Error(
"useTheme must be used inside ThemeProvider"
);

}

return context;

};