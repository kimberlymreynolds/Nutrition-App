import React, { createContext, useContext } from 'react';

export const RecipeContext = createContext(() => {});

// Renders a food's name. Meals (items with a .recipe) become a tappable link
// that opens the recipe; everything else is plain text.
export function FoodName({ it }) {
  const openRecipe = useContext(RecipeContext);
  if (it && it.recipe) {
    return <button className="recipe-link" onClick={() => openRecipe(it.id)}>{it.name}</button>;
  }
  return <React.Fragment>{it ? it.name : ''}</React.Fragment>;
}
