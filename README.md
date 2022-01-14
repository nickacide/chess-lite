# Chess Lite `v0.0.1`
Chess Lite takes a more pragmatic approach to my other [chess engine](https://github.com/nickacide/chess-engine). What makes this release much better than my other one is the fact that the `engine.js` file doesn't need any information from other files. It simply distributes all the functions required to create a chess client. Not only is this a huge improvement (making it reusable for other chess-related projects), but this approach also improves performance and readability. 
##  Key differences and Concepts
Along with a whole rewrite of the engine file, this project also boasts:
- **Improved function parameters, preventing your code from repeatedly calculating known data.**
	eg: Since we already determine the board state given the FEN, we don't need to provide the fen to a certain 	function, but rather feed the board as parameter. This saves on performance as code is calculated once and for all.
- **The board stores all the FEN data in a 12x12 array.**
	A key problem in the previous engine is that we were using an 8x8 board to represent the FEN string. Because we had no efficient way of knowing when a piece should stop looking in a certain direction with an 8x8 board, we obscure the readability and performance that we try to improve. 
- **Less hardcoded values, allowing for easily implementing custom chess logic**
	Due to the use of more constants and less hardcoded variable reliability, you can easily change, for example, how a queen moves. Because I was repeating myself so much in the previous engine, implementation became an inconvenience.

## Future Goals for Chess Lite
I am starting Grade 11 this year, thus I need a lot of focus and dedication towards the year's challenges. Although I really enjoy programming, I have to realize that my GPA will determine whether I am satisfied with my university choices or not. **The Bottom Line** is that I will be very busy. 

Apart from implementing the functionality for piece movement and standard chess logic, I have no real idea what to add yet. A few ideas that I were pondering about included:
- Implementing a **chess** command for my discord bot.
- Creating a website allowing for chess matchmaking using P2P (peer-to-peer)
- Attempting to create a chess position evaluator. Might be very inefficient :P
